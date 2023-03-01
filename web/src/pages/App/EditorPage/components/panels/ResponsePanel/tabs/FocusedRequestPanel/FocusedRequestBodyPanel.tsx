import { useEffect, useMemo } from 'react'

import { RESTRequest } from '@apiteam/types'
import { getPrettyContentTypes, knownContentTypes } from '@apiteam/types'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import InventoryIcon from '@mui/icons-material/Inventory'
import { useTheme, Typography, Stack, Tooltip, IconButton } from '@mui/material'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { EmptyPanelMessage } from 'src/components/app/utils/EmptyPanelMessage'
import { KeyValueResultsTable } from 'src/components/app/utils/KeyValueResultsTable'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'

type FocusedRequestBodyPanelProps = {
  body: RESTRequest['body']
  setActionArea: (actionArea: React.ReactNode) => void
  requestId: string
}

export const FocusedRequestBodyPanel = ({
  body,
  setActionArea,
  requestId,
}: FocusedRequestBodyPanelProps) => {
  const theme = useTheme()

  const prettyName = useMemo(() => {
    // Edge case for when the body is undefined
    if (body === undefined) {
      return 'None'
    }

    if (body.contentType === 'none') {
      return 'None'
    }

    if (body.contentType === 'application/octet-stream' && body.body === null) {
      return 'None'
    }

    return knownContentTypes[body.contentType]
  }, [body])

  useEffect(() => {
    if (prettyName === 'None' || prettyName === 'File') {
      setActionArea(null)
    } else {
      const customActions = []

      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <IconButton
            onClick={() => navigator.clipboard.writeText(body.body as string)}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      )

      setActionArea(<QuickActionArea customActions={customActions} />)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prettyName])

  const keyValueData = useMemo(() => {
    // Edge case for when the body is undefined
    if (body === undefined) return null

    if (body.contentType === 'application/x-www-form-urlencoded') {
      return body.body.map(({ keyString, value }) => ({
        key: keyString,
        value,
      }))
    }

    if (body.contentType === 'multipart/form-data') {
      return body.body.map(({ keyString, value, isFile, fileField }) => ({
        key: keyString,
        value: isFile ? fileField?.filename ?? 'Unknown file' : value,
      }))
    }

    return null
  }, [body])

  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
      }}
    >
      <Typography
        variant="body1"
        fontWeight="bold"
        sx={{
          userSelect: 'none',
        }}
      >
        Body Type: {prettyName}
      </Typography>
      {prettyName === 'None' && (
        <EmptyPanelMessage
          primaryText="No body"
          secondaryMessages={['No body was sent with this request.']}
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
      {prettyName === 'JSON' && body.contentType === 'application/json' && (
        <MonacoEditor
          value={body.body}
          language="json"
          readOnly
          namespace={`response-${requestId}-json`}
        />
      )}
      {prettyName === 'XML' && body.contentType === 'application/xml' && (
        <MonacoEditor
          value={body.body}
          language="xml"
          readOnly
          namespace={`response-${requestId}-xml`}
        />
      )}
      {prettyName === 'HTML' && body.contentType === 'text/html' && (
        <MonacoEditor
          value={body.body}
          language="html"
          readOnly
          namespace={`response-${requestId}-html`}
        />
      )}
      {prettyName === 'Plain' && body.contentType === 'text/plain' && (
        <MonacoEditor
          value={body.body}
          language="plain"
          readOnly
          namespace={`response-${requestId}-plain`}
        />
      )}
      {prettyName === 'Form URL Encoded' &&
        keyValueData !== null &&
        body.contentType === 'application/x-www-form-urlencoded' && (
          <KeyValueResultsTable
            values={keyValueData}
            setActionArea={setActionArea}
          />
        )}
      {prettyName === 'Form Data' &&
        keyValueData !== null &&
        body.contentType === 'multipart/form-data' && (
          <KeyValueResultsTable
            values={keyValueData}
            setActionArea={setActionArea}
          />
        )}
      {prettyName === 'File' &&
        body.contentType === 'application/octet-stream' && (
          <EmptyPanelMessage
            primaryText="File"
            secondaryMessages={[
              'File sent with this request:',
              body.body?.filename ?? 'Unknown file',
            ]}
            icon={
              <InsertDriveFileIcon
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
    </Stack>
  )
}
