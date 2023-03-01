/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import type {
  ConsoleMessagesPoller,
  IntervalsPoller,
  LocationPoller,
  SummaryPoller,
  ThresholdsPoller,
  MessagesPoller,
  ChecksPoller,
} from '@apiteam/datapeak'
import type { Socket } from 'socket.io-client'
import type { Map as YMap } from 'yjs'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { useDatapeakModule } from 'src/contexts/imports/datapeak-provider'
import { useYMap } from 'src/lib/zustand-yjs'
import { retrieveScopedResource } from 'src/store'
import { streamExistingTest } from 'src/test-manager/executors'

type PollerCallback<T> = T extends new (
  arg1: any,
  arg2: infer U,
  ...args: any
) => any
  ? U
  : never

type DataPeakCallbacks = {
  onThresholds?: PollerCallback<typeof ThresholdsPoller>
  onConsoleUpdates?: PollerCallback<typeof ConsoleMessagesPoller>
  onIntervalUpdates?: PollerCallback<typeof IntervalsPoller>
  onSummaryUpdates?: PollerCallback<typeof SummaryPoller>
  onLocationUpdates?: PollerCallback<typeof LocationPoller>
  onCheckUpdates?: PollerCallback<typeof ChecksPoller>
  onNoticeUpdates?: (notices: DataPeakState['notices']) => void
}

type DataPeakState = {
  onUnmount: () => void
  notices: {
    unverifiedDomainThrottled: boolean
    consoleLogsLimited: boolean
    outputsLimited: boolean
  }
  testInfoId: string | null
}

export const useDatapeakCurrentTest = (
  scopeId: string | null,
  rawBearer: string | null,
  resposeKind: YMap<any>,
  callbacks: DataPeakCallbacks
): DataPeakState => {
  const datapeakModule = useDatapeakModule()

  const responseKindHook = useYMap(resposeKind)

  const jobId = useMemo(
    () => resposeKind.get('jobId') as string,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseKindHook]
  )

  const [testInfoId, setTestInfoId] = useState<string | null>(null)

  const [consoleMessagesPoller, setConsoleMessagesPoller] =
    useState<ConsoleMessagesPoller | null>(null)

  const [thresholdsPoller, setThresholdsPoller] =
    useState<ThresholdsPoller | null>(null)

  const [intervalsPoller, setIntervalsPoller] =
    useState<IntervalsPoller | null>(null)

  const [locationPoller, setLocationPoller] = useState<LocationPoller | null>(
    null
  )

  const [summaryPoller, setSummaryPoller] = useState<SummaryPoller | null>(null)

  const [messagesPoller, setMessagesPoller] = useState<MessagesPoller | null>(
    null
  )

  const [checksPoller, setChecksPoller] = useState<ChecksPoller | null>(null)

  const [notices, setNotices] = useState<DataPeakState['notices']>({
    unverifiedDomainThrottled: false,
    consoleLogsLimited: false,
    outputsLimited: false,
  })

  const [socket, setSocket] = useState<Socket | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized || !rawBearer || !scopeId || !jobId) {
      return
    }

    // This section is only meant for running once per test#
    setInitialized(true)

    const testInfoId = datapeakModule.initTestData()
    setTestInfoId(testInfoId)

    if (callbacks.onNoticeUpdates) {
      setConsoleMessagesPoller(
        new datapeakModule.ConsoleMessagesPoller(testInfoId, (c) =>
          callbacks.onConsoleUpdates?.(c)
        )
      )
    }

    if (callbacks.onThresholds) {
      setThresholdsPoller(
        new datapeakModule.ThresholdsPoller(testInfoId, (t) =>
          callbacks.onThresholds?.(t)
        )
      )
    }

    if (callbacks.onSummaryUpdates) {
      setSummaryPoller(
        new datapeakModule.SummaryPoller(testInfoId, (s) =>
          callbacks.onSummaryUpdates?.(s)
        )
      )
    }

    if (callbacks.onLocationUpdates) {
      setLocationPoller(
        new datapeakModule.LocationPoller(testInfoId, (l) =>
          callbacks.onLocationUpdates?.(l)
        )
      )
    }

    if (callbacks.onIntervalUpdates) {
      setIntervalsPoller(
        new datapeakModule.IntervalsPoller(testInfoId, () =>
          callbacks.onIntervalUpdates?.()
        )
      )
    }

    if (callbacks.onCheckUpdates) {
      setChecksPoller(
        new datapeakModule.ChecksPoller(testInfoId, (c) =>
          callbacks.onCheckUpdates?.(c)
        )
      )
    }

    setMessagesPoller(
      new datapeakModule.MessagesPoller(testInfoId, (messages) => {
        let newNotices = notices
        let updatedNotices = false

        messages.forEach((m) => {
          if (m === 'MAX_OUTPUTS_REACHED') {
            newNotices = { ...newNotices, outputsLimited: true }
            updatedNotices = true
          } else if (m === 'MAX_CONSOLE_LOGS_REACHED') {
            newNotices = { ...newNotices, consoleLogsLimited: true }
            updatedNotices = true
          } else if (m === 'UNVERIFIED_DOMAIN_THROTTLED') {
            newNotices = { ...newNotices, unverifiedDomainThrottled: true }
            updatedNotices = true
          }
        })

        if (updatedNotices) {
          setNotices(newNotices)
        }
      })
    )

    setSocket(
      streamExistingTest({
        jobId,
        scopeId,
        rawBearer,
        onMessage: (message) => {
          if (
            message.messageType === 'INTERVAL' ||
            message.messageType === 'CONSOLE' ||
            message.messageType === 'THRESHOLD'
          ) {
            datapeakModule.addStreamedData(
              testInfoId,
              Buffer.from(message.message, 'base64')
            )
          } else if (message.messageType === 'OPTIONS') {
            const locations = message.message.loadDistribution.map(
              (ldl) => ldl.location
            )

            datapeakModule.setLocations(testInfoId, locations)
          } else if (message.messageType === 'MESSAGE') {
            datapeakModule.addMessage(testInfoId, message.message)
          }
        },
        executionAgent:
          resposeKind.get('executionAgent') === 'Local' ? 'Local' : 'Cloud',
      })
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawBearer, scopeId, jobId])

  useEffect(() => {
    if (callbacks.onNoticeUpdates) {
      callbacks.onNoticeUpdates(notices)
    }
  }, [notices, callbacks])

  const datapeakState = useMemo<DataPeakState>(() => {
    if (
      !socket ||
      !consoleMessagesPoller ||
      !thresholdsPoller ||
      !summaryPoller ||
      !locationPoller ||
      !intervalsPoller ||
      !intervalsPoller ||
      !messagesPoller ||
      !checksPoller
    ) {
      return {
        onUnmount: () => {},
        notices,
        testInfoId,
      }
    }

    return {
      onUnmount: () => {
        consoleMessagesPoller.destroy()
        thresholdsPoller.destroy()
        summaryPoller.destroy()
        locationPoller.destroy()
        intervalsPoller.destroy()
        messagesPoller.destroy()
        checksPoller.destroy()

        socket.disconnect()
      },
      notices,
      testInfoId,
    }
  }, [
    socket,
    consoleMessagesPoller,
    thresholdsPoller,
    summaryPoller,
    locationPoller,
    intervalsPoller,
    messagesPoller,
    checksPoller,
    notices,
    testInfoId,
  ])

  return datapeakState
}

export const useDataPeakStore = (
  scopeId: string | null,
  rawBearer: string | null,
  resposeKind: YMap<any>,
  callbacks: DataPeakCallbacks
) => {
  const datapeakModule = useDatapeakModule()

  const responseKindHook = useYMap(resposeKind)

  const { jobId, testInfoStoreReceipt } = useMemo(
    () => ({
      jobId: resposeKind.get('jobId') as string,
      testInfoStoreReceipt: resposeKind.get('testInfoStoreReceipt') as string,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [responseKindHook]
  )

  const [testInfoId, setTestInfoId] = useState<string | null>(null)

  const [consoleMessagesPoller, setConsoleMessagesPoller] =
    useState<ConsoleMessagesPoller | null>(null)

  const [thresholdsPoller, setThresholdsPoller] =
    useState<ThresholdsPoller | null>(null)

  const [intervalsPoller, setIntervalsPoller] =
    useState<IntervalsPoller | null>(null)

  const [locationPoller, setLocationPoller] = useState<LocationPoller | null>(
    null
  )

  const [summaryPoller, setSummaryPoller] = useState<SummaryPoller | null>(null)

  const [messagesPoller, setMessagesPoller] = useState<MessagesPoller | null>(
    null
  )

  const [checksPoller, setChecksPoller] = useState<ChecksPoller | null>(null)

  const [notices, setNotices] = useState<DataPeakState['notices']>({
    unverifiedDomainThrottled: false,
    consoleLogsLimited: false,
    outputsLimited: false,
  })

  const [data, setData] = useState<Uint8Array | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized || !rawBearer || !scopeId || !jobId) {
      return
    }

    // This section is only meant for running once per test
    setInitialized(true)

    retrieveScopedResource({
      scopeId,
      rawBearer,
      storeReceipt: testInfoStoreReceipt,
    })
      .catch((e) => {
        snackErrorMessageVar('Failed to retrieve test info: ' + e.message)

        return null
      })
      .then((response) => {
        if (!response) {
          return
        }

        // The data already is a Uint8Array
        setData(response.data)
      })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawBearer, scopeId, jobId])

  useEffect(() => {
    if (!data) {
      return
    }

    const testInfoId = datapeakModule.initTestData(data)
    setTestInfoId(testInfoId)

    if (callbacks.onNoticeUpdates) {
      setConsoleMessagesPoller(
        new datapeakModule.ConsoleMessagesPoller(testInfoId, (c) =>
          callbacks.onConsoleUpdates?.(c)
        )
      )
    }

    if (callbacks.onThresholds) {
      setThresholdsPoller(
        new datapeakModule.ThresholdsPoller(testInfoId, (t) =>
          callbacks.onThresholds?.(t)
        )
      )
    }

    if (callbacks.onSummaryUpdates) {
      setSummaryPoller(
        new datapeakModule.SummaryPoller(testInfoId, (s) =>
          callbacks.onSummaryUpdates?.(s)
        )
      )
    }

    if (callbacks.onLocationUpdates) {
      setLocationPoller(
        new datapeakModule.LocationPoller(testInfoId, (l) =>
          callbacks.onLocationUpdates?.(l)
        )
      )
    }

    if (callbacks.onIntervalUpdates) {
      setIntervalsPoller(
        new datapeakModule.IntervalsPoller(testInfoId, () =>
          callbacks.onIntervalUpdates?.()
        )
      )
    }

    if (callbacks.onCheckUpdates) {
      setChecksPoller(
        new datapeakModule.ChecksPoller(testInfoId, (c) =>
          callbacks.onCheckUpdates?.(c)
        )
      )
    }

    setMessagesPoller(
      new datapeakModule.MessagesPoller(testInfoId, (messages) => {
        let newNotices = notices
        let updatedNotices = false

        messages.forEach((m) => {
          if (m === 'MAX_OUTPUTS_REACHED') {
            newNotices = { ...newNotices, outputsLimited: true }
            updatedNotices = true
          } else if (m === 'MAX_CONSOLE_LOGS_REACHED') {
            newNotices = { ...newNotices, consoleLogsLimited: true }
            updatedNotices = true
          } else if (m === 'UNVERIFIED_DOMAIN_THROTTLED') {
            newNotices = { ...newNotices, unverifiedDomainThrottled: true }
            updatedNotices = true
          }
        })

        if (updatedNotices) {
          setNotices(newNotices)
        }
      })
    )

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  const datapeakState = useMemo<DataPeakState>(() => {
    if (
      !consoleMessagesPoller ||
      !thresholdsPoller ||
      !summaryPoller ||
      !locationPoller ||
      !intervalsPoller ||
      !intervalsPoller ||
      !messagesPoller ||
      !checksPoller
    ) {
      return {
        onUnmount: () => {},
        testInfoId,
        notices,
      }
    }

    return {
      onUnmount: () => {
        consoleMessagesPoller.destroy()
        thresholdsPoller.destroy()
        summaryPoller.destroy()
        locationPoller.destroy()
        intervalsPoller.destroy()
        messagesPoller.destroy()
        checksPoller.destroy()
      },
      testInfoId,
      notices,
    }
  }, [
    consoleMessagesPoller,
    thresholdsPoller,
    summaryPoller,
    locationPoller,
    intervalsPoller,
    messagesPoller,
    checksPoller,
    testInfoId,
    notices,
  ])

  return datapeakState
}
