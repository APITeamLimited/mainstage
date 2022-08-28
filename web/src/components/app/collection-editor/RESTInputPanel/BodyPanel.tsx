import { useEffect, useRef, useState } from 'react'

import InventoryIcon from '@mui/icons-material/Inventory'
import { Stack, useTheme } from '@mui/material'

import {
  ValidContentTypes,
  RESTReqBody,
  knownContentTypes,
} from 'src/contexts/reactives'

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
  const bodyRef = useRef<RESTReqBody | null>(null)
  const [tab, setTab] = useState<number>(0)
  bodyRef.current = body
  const [isBulkEditing, setIsBulkEditing] = useState(false)

  const handeChipChange = (index: number) => {
    const contentType = getContentTypeFromIndex(index)

    if (!contentType) {
      handeChipChange(0)
      return
    }

    setTab(index)

    if (contentType === 'None') {
      setBody({
        contentType: null,
        body: null,
      })
    } else if (contentType === 'multipart/form-data') {
      setBody({
        contentType,
        body: [],
      })
    } else if (contentType === 'application/x-www-form-urlencoded') {
      setBody({
        contentType,
        body: [],
      })
    } else {
      setBody({
        contentType,
        body: '',
      })
    }
  }

  const handlePrettyPrint = () => {
    console.log(bodyRef.current)
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
    const contentTypeFromTab = getContentTypeFromIndex(tab) || ''
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
          isBulkEditing={isBulkEditing}
          namespace={`${requestId}${body.contentType}`}
        />
      )}
    </Stack>
  )
}
