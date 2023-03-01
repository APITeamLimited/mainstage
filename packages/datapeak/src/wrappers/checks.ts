import { rawGetChecks, rawGetChecksState } from 'src/datapeak-raw/pkg/datapeak'

import type { Threshold } from './thresholds'

export type CheckCollection = {
  scenarios: Check[]
  groups: Check[]
  named: Check[]
}

export type Check = {
  name: string
  rates: Record<string, CheckRate>
  threshold: Threshold | null
}

export type CheckRate = {
  sinkPath: string
  pass: number
  fail: number
  total: number
  rate: number
}

export const getChecks = rawGetChecks as (testInfoId: string) => CheckCollection

export class ChecksPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (checks: CheckCollection) => void
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: (checks: CheckCollection) => void,
    pollInterval = 1000
  ) {
    this.testInfoId = testInfoId
    this.callback = callback
    this.pollInterval = pollInterval
    this.poll()
  }

  private async poll() {
    const newState = rawGetChecksState(this.testInfoId)
    if (newState !== this.state) {
      this.state = newState
      this.callback(rawGetChecks(this.testInfoId))
    }
    this.intervalId = setTimeout(() => this.poll(), this.pollInterval)
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
