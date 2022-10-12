import { useEffect, useRef, useState } from 'react'

import {
  getKnownContentTypes,
  getPrettyContentTypes,
  RESTReqBody,
  ValidContentTypes,
} from '@apiteam/types/src/entities'
import InventoryIcon from '@mui/icons-material/Inventory'
import { Stack, useTheme } from '@mui/material'

import { KeyValueEditor } from 'src/components/app/KeyValueEditor'
import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { StoredDropzone } from 'src/components/app/utils/FileDropzone'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'
import { codeFormatter } from 'src/utils/codeFormatter'

type BodyPanelProps = {
  requestId: string
  body: RESTReqBody
  setBody: (newBody: RESTReqBody) => void
  setActionArea: (actionArea: React.ReactNode) => void
}

const possibleContentTypes = getKnownContentTypes()
const possiblePrettyTypes = getPrettyContentTypes()

export const getIndexOfContentType = (contentType: string | null) =>
  possibleContentTypes.findIndex(
    (knownContentType) => knownContentType === contentType
  ) || null

const getContentTypeFromIndex = (index: number) => {
  if (index > possibleContentTypes.length) {
    return undefined
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

    if (contentType === 'none') {
      setBody(
        unsavedBodies.find(
          (unsavedBody) => unsavedBody.contentType === 'none'
        ) || {
          contentType: 'none',
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
    } else if (contentType === 'application/octet-stream') {
      setBody(
        unsavedBodies.find(
          (unsavedBody) => unsavedBody.contentType === contentType
        ) || {
          contentType: contentType,
          body: null,
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

  const handlePrettyPrint = async () => {
    if (bodyRef.current === null) throw new Error('bodyRef.current is null')
    if (!bodyRef.current.contentType) {
      throw new Error('bodyRef.current.contentType is null')
    }

    if (bodyRef.current.contentType === 'application/json') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: await codeFormatter(bodyRef.current.body, 'json'),
      })
    } else if (bodyRef.current.contentType === 'application/xml') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: await codeFormatter(bodyRef.current.body, 'xml'),
      })
    } else if (bodyRef.current.contentType === 'text/html') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: await codeFormatter(bodyRef.current.body, 'html'),
      })
    } else {
      throw new Error('Unsupported content type for pretty print')
    }
  }

  const handleBodyDelete = () => {
    if (bodyRef.current?.contentType === undefined) {
      throw new Error('bodyRef.current is undefined')
    }

    if (bodyRef.current?.contentType === 'none') {
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

    if (bodyRef.current?.contentType === 'application/octet-stream') {
      setBody({
        contentType: bodyRef.current.contentType,
        body: null,
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

    // If body is application/octet-stream or none , clear the action area
    if (
      bodyRef.current?.contentType === 'application/octet-stream' ||
      bodyRef.current?.contentType === 'none'
    ) {
      setActionArea(null)
      return
    }

    const contentTypeFromTab = getContentTypeFromIndex(tab || 0)
    const includePrettyPrint = contentTypeFromTab
      ? prettyPrintTypes.includes(contentTypeFromTab)
      : false
    const includeBulkEdit = contentTypeFromTab
      ? bulkEditTypes.includes(contentTypeFromTab)
      : false

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
        names={possiblePrettyTypes}
        value={getIndexOfContentType(body.contentType) || 0}
        onChange={handeChipChange}
      />
      {body.contentType === 'application/json' && (
        <MonacoEditor
          value={body.body}
          language="json"
          onChange={(value) => setBody({ ...body, body: value })}
          namespace={`request-${requestId}-json`}
        />
      )}
      {body.contentType === 'application/xml' && (
        <MonacoEditor
          value={body.body}
          language="xml"
          onChange={(value) => setBody({ ...body, body: value })}
          namespace={`request-${requestId}-xml`}
        />
      )}
      {body.contentType === 'text/html' && (
        <MonacoEditor
          value={body.body}
          language="html"
          onChange={(value) => setBody({ ...body, body: value })}
          namespace={`request-${requestId}-html`}
        />
      )}
      {body.contentType === 'text/plain' && (
        <MonacoEditor
          value={body.body}
          language="plain"
          onChange={(value) => setBody({ ...body, body: value })}
          namespace={`request-${requestId}-plain`}
        />
      )}
      {body.contentType === 'none' && (
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
      {body.contentType === 'multipart/form-data' && (
        <KeyValueEditor
          items={body.body}
          setItems={(bodyValues) => setBody({ ...body, body: bodyValues })}
          setActionArea={setActionArea}
          namespace={`${requestId}${body.contentType}`}
          variant="filefield"
        />
      )}
      {body.contentType === 'application/octet-stream' && (
        <StoredDropzone
          file={body.body}
          setFile={(file) => {
            // Fix for an error when null wrongfully gets passed to setFile
            if (file !== null) {
              setBody({ ...body, body: file })
            }
          }}
          onDelete={() => setBody({ ...body, body: null })}
          primaryText="Drop file here"
          secondaryMessages={['Or click to browse']}
        />
      )}
    </Stack>
  )
}
