import { useEffect, useRef, useState } from 'react'

import InventoryIcon from '@mui/icons-material/Inventory'
import { Stack, useTheme } from '@mui/material'

import {
  ValidContentTypes,
  RESTReqBody,
  knownContentTypes,
} from 'src/contexts/reactives'
import { codeFormatter } from 'src/utils/codeFormatter'

import { EmptyPanelMessage } from '../../utils/EmptyPanelMessage'
import { QuickActionArea } from '../../utils/QuickActionArea'
import { SecondaryChips } from '../../utils/SecondaryChips'
import { KeyValueEditor } from '../KeyValueEditor'
import { MonacoEditor } from '../MonacoEditor'

type BodyPanelProps = {
  requestId: string
  body: RESTReqBody
  setBody: (newBody: RESTReqBody) => void
  setActionArea: (actionArea: React.ReactNode) => void
}

const possibleContentTypes = [...Object.keys(knownContentTypes), 'None']

const getIndexOfContentType = (contentType: string | null) => {
  const findWith = contentType === null ? 'None' : contentType

  return (
    possibleContentTypes.findIndex(
      (knownContentType) => knownContentType === findWith
    ) || null
  )
}

const getContentTypeFromIndex = (index: number) => {
  if (index > possibleContentTypes.length) {
    return undefined
  }
  return possibleContentTypes[index] as ValidContentTypes | 'None'
}

const prettyPrintTypes = ['application/json', 'application/xml', 'text/html']
const bulkEditTypes = [
  'application/x-www-form-urlencoded',
  'multipart/form-data',
]

export const BodyPanel = ({
  requestId,
  body,
  setBody,
  setActionArea,
}: BodyPanelProps) => {
  const theme = useTheme()

  const [unsavedBodies, setUnsavedBodies] = useState<RESTReqBody[]>([body])

  const bodyRef = useRef<RESTReqBody | null>(null)
  const [tab, setTab] = useState<number>()
  bodyRef.current = body
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  const handeChipChange = (index: number) => {
    const contentType = getContentTypeFromIndex(index)

    if (!contentType) {
      handeChipChange(0)
      return
    }

    setUnsavedBodies((prev) => {
      const newUnsavedBodies = prev.filter(
        (unsavedBody) => unsavedBody.contentType !== body.contentType
      )
      return [...newUnsavedBodies, body]
    })

    setTab(index)

    if (contentType === 'None') {
      setBody(
        unsavedBodies.find(
          (unsavedBody) => unsavedBody.contentType === null
        ) || {
          contentType: null,
          body: null,
        }
      )
    } else if (
      contentType === 'application/x-www-form-urlencoded' ||
      contentType === 'multipart/form-data'
    ) {
      setBody(
        unsavedBodies.find(
          (unsavedBody) => unsavedBody.contentType === contentType
        ) || {
          contentType: contentType,
          body: [],
        }
      )
    } else {
      setBody(
        unsavedBodies.find(
          (unsavedBody) => unsavedBody.contentType === contentType
        ) || {
          contentType: contentType,
          body: '',
        }
      )
    }
  }

  const handlePrettyPrint = () => {
    if (bodyRef.current === null) throw new Error('bodyRef.current is null')
    if (!bodyRef.current.contentType) {
      throw new Error('bodyRef.current.contentType is null')
    }

    if (bodyRef.current.contentType === 'application/json') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: codeFormatter(bodyRef.current.body, 'json'),
      })
    } else if (bodyRef.current.contentType === 'application/xml') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: codeFormatter(bodyRef.current.body, 'xml'),
      })
    } else if (bodyRef.current.contentType === 'text/html') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: codeFormatter(bodyRef.current.body, 'html'),
      })
    } else {
      throw new Error('Unsupported content type for pretty print')
    }
  }

  const handleBodyDelete = () => {
    if (bodyRef.current?.contentType === undefined) {
      throw new Error('bodyRef.current is undefined')
    }

    if (bodyRef.current?.contentType === null) {
      return
    }

    if (
      bodyRef.current?.contentType === 'multipart/form-data' ||
      bodyRef.current?.contentType === 'application/x-www-form-urlencoded'
    ) {
      setBody({
        contentType: bodyRef.current.contentType,
        body: [],
      })
      return
    }

    setBody({
      contentType: bodyRef.current.contentType,
      body: '',
    })
  }

  useEffect(() => {
    // Don't run for application/x-www-form-urlencoded and multipart/form-data
    if (
      bodyRef.current?.contentType === 'multipart/form-data' ||
      bodyRef.current?.contentType === 'application/x-www-form-urlencoded'
    ) {
      return
    }

    const contentTypeFromTab = (tab && getContentTypeFromIndex(tab)) || ''
    const includePrettyPrint = prettyPrintTypes.includes(contentTypeFromTab)
    const includeBulkEdit = bulkEditTypes.includes(contentTypeFromTab)

    if (!includeBulkEdit) setIsBulkEditing(false)

    const isDeletable = bodyRef.current?.contentType !== null

    setActionArea(
      <QuickActionArea
        onDeleteCallback={isDeletable ? handleBodyDelete : undefined}
        prettyPrintCallback={includePrettyPrint ? handlePrettyPrint : undefined}
        isBulkEditing={includeBulkEdit ? isBulkEditing : undefined}
        setIsBulkEditing={includeBulkEdit ? setIsBulkEditing : undefined}
      />
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, isBulkEditing])

  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
        margin: 0,
      }}
    >
      <SecondaryChips
        names={possibleContentTypes}
        value={getIndexOfContentType(body.contentType) || 0}
        onChange={handeChipChange}
      />
      {body.contentType === 'application/json' && (
        <MonacoEditor
          value={body.body}
          language="json"
          onChange={(value) => setBody({ ...body, body: value })}
        />
      )}
      {body.contentType === 'application/xml' && (
        <MonacoEditor
          value={body.body}
          language="xml"
          onChange={(value) => setBody({ ...body, body: value })}
        />
      )}
      {body.contentType === 'text/html' && (
        <MonacoEditor
          value={body.body}
          language="html"
          onChange={(value) => setBody({ ...body, body: value })}
        />
      )}
      {body.contentType === 'text/plain' && (
        <MonacoEditor
          value={body.body}
          language="plain"
          onChange={(value) => setBody({ ...body, body: value })}
        />
      )}
      {body.contentType === null && (
        <EmptyPanelMessage
          primaryText="No body"
          secondaryMessages={[
            'If you want to add a body, select from the types above',
          ]}
          icon={
            <InventoryIcon
              sx={{
                marginBottom: 2,
                width: 80,
                height: 80,
                color: theme.palette.action.disabled,
              }}
            />
          }
        />
      )}

      {body.contentType === 'application/x-www-form-urlencoded' && (
        <KeyValueEditor
          items={body.body}
          setItems={(bodyValues) => setBody({ ...body, body: bodyValues })}
          setActionArea={setActionArea}
          namespace={`${requestId}${body.contentType}`}
        />
      )}
    </Stack>
  )
}
