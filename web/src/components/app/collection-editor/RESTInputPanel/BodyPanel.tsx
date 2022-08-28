import { useEffect, useRef, useState } from 'react'

import InventoryIcon from '@mui/icons-material/Inventory'
import { Stack, Typography, useTheme } from '@mui/material'

import {
  ValidContentTypes,
  RESTReqBody,
  knownContentTypes,
} from 'src/contexts/reactives'

import { SecondaryChips } from '../../utils/SecondaryChips'
import { KeyValueEditor } from '../KeyValueEditor'
import { MonacoEditor } from '../MonacoEditor'

import { QuickActions } from './QuickActions'

type BodyPanelProps = {
  requestId: string
  body: RESTReqBody
  setBody: (newBody: RESTReqBody) => void
  setActionArea: (actionArea: React.ReactNode) => void
}

const possibleContentTypes = [...Object.keys(knownContentTypes), null]

const getIndexOfContentType = (contentType: string | null) => {
  return (
    possibleContentTypes.findIndex(
      (knownContentType) => knownContentType === contentType
    ) || null
  )
}

const getContentTypeFromIndex = (index: number) => {
  if (index > possibleContentTypes.length) {
    return null
  }
  return possibleContentTypes[index] as ValidContentTypes
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
    setTab(index)
    const contentType = getContentTypeFromIndex(index)

    if (!contentType) {
      return
    }

    if (contentType === null) {
      setBody({
        contentType,
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

  const handleBodyDelete = () => {}

  useEffect(() => {
    const contentTypeFromTab = getContentTypeFromIndex(tab) || ''
    const includePrettyPrint = prettyPrintTypes.includes(contentTypeFromTab)
    const includeBulkEdit = bulkEditTypes.includes(contentTypeFromTab)

    if (!includeBulkEdit) setIsBulkEditing(false)

    setActionArea(
      <QuickActions
        onDeleteCallback={handleBodyDelete}
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
        <Stack
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <InventoryIcon
            sx={{
              marginBottom: 2,
              width: 80,
              height: 80,
              color: theme.palette.action.disabled,
            }}
          />
          <Typography variant="h6">No body selected</Typography>
          <Typography variant="caption" color={theme.palette.text.secondary}>
            If you want to add a body, select from the types above
          </Typography>
        </Stack>
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
