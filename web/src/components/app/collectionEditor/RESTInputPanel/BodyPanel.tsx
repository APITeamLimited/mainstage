import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import InventoryIcon from '@mui/icons-material/Inventory'
import {
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'
import parserBabel from 'prettier/parser-babel'
import prettier from 'prettier/standalone'
import parserXML from 'web/lib/plugin-xml/src/parser'

import {
  ValidContentTypes,
  knownContentTypes,
  RESTReqBody,
} from 'src/contexts/reactives'

import { MonacoEditor } from '../MonacoEditor'

import { XWWWFormUrlencodedEditor } from './XWWWFormUrlencodedEditor'

type BodyPanelProps = {
  body: RESTReqBody
  setBody: (newBody: RESTReqBody) => void
}

const formatMonacoEditor = (rawBody: string, language: string) => {
  switch (language) {
    case 'json':
      return prettier?.format(rawBody, {
        parser: 'json',
        plugins: [parserBabel],
        tabWidth: 4,
      })
    default:
      throw `formatMonacoEditor unsupported language: ${language}`
  }
}

export const BodyPanel = ({ body, setBody }: BodyPanelProps) => {
  const theme = useTheme()

  const handeChangeType = (newType: ValidContentTypes) => {
    if (newType === null) {
      setBody({
        contentType: null,
        body: null,
      })
    } else if (newType === 'multipart/form-data') {
      setBody({
        contentType: newType,
        body: [],
      })
    } else if (newType === 'application/x-www-form-urlencoded') {
      setBody({
        contentType: newType,
        body: [],
      })
    } else {
      setBody({
        contentType: newType,
        body: '',
      })
    }
  }

  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
        margin: 0,
      }}
    >
      <Grid container spacing={2} margin={0}>
        {[...Object.keys(knownContentTypes), null].map(
          (knownContentType, index) => (
            <Chip
              color="primary"
              key={index}
              label={
                <Typography
                  sx={{
                    color:
                      body.contentType === knownContentType
                        ? 'inherit'
                        : 'text.secondary',
                  }}
                >
                  {knownContentType !== null ? knownContentType : 'None'}
                </Typography>
              }
              variant={
                body.contentType === knownContentType ? 'filled' : 'outlined'
              }
              onClick={() =>
                handeChangeType((knownContentType as ValidContentTypes) || null)
              }
              size="small"
              sx={{
                marginRight: 1,
                marginBottom: 1,
                borderWidth:
                  body.contentType === knownContentType ? undefined : 0,
              }}
            />
          )
        )}
      </Grid>
      {body.contentType === 'application/json' && (
        <>
          <Stack
            justifyContent="flex-end"
            alignItems="center"
            width="100%"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Pretty Print">
              <IconButton
                onClick={() =>
                  setBody({
                    ...body,
                    body: formatMonacoEditor(body.body, 'json'),
                  })
                }
              >
                <AutoFixHighIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete All">
              <IconButton onClick={() => setBody({ ...body, body: '' })}>
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <MonacoEditor
            value={body.body}
            language="json"
            onChange={(value) => setBody({ ...body, body: value })}
          />
        </>
      )}
      {body.contentType === 'application/xml' && (
        <>
          <Stack
            justifyContent="flex-end"
            alignItems="center"
            width="100%"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Pretty Print">
              <IconButton
                onClick={() =>
                  setBody({
                    ...body,
                    body: formatMonacoEditor(body.body, 'xml'),
                  })
                }
              >
                <AutoFixHighIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete All">
              <IconButton onClick={() => setBody({ ...body, body: '' })}>
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <MonacoEditor
            value={body.body}
            language="xml"
            onChange={(value) => setBody({ ...body, body: value })}
          />
        </>
      )}
      {body.contentType === 'text/html' && (
        <>
          <Stack
            justifyContent="flex-end"
            alignItems="center"
            width="100%"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Pretty Print">
              <IconButton
                onClick={() =>
                  setBody({
                    ...body,
                    body: formatMonacoEditor(body.body, 'html'),
                  })
                }
              >
                <AutoFixHighIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete All">
              <IconButton onClick={() => setBody({ ...body, body: '' })}>
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <MonacoEditor
            value={body.body}
            language="html"
            onChange={(value) => setBody({ ...body, body: value })}
          />
        </>
      )}
      {body.contentType === 'text/plain' && (
        <>
          <Stack
            justifyContent="flex-end"
            alignItems="center"
            width="100%"
            direction="row"
            spacing={1}
          >
            <Tooltip title="Delete All">
              <IconButton onClick={() => setBody({ ...body, body: '' })}>
                <DeleteSweepIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <MonacoEditor
            value={body.body}
            language="plain"
            onChange={(value) => setBody({ ...body, body: value })}
          />
        </>
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
        <XWWWFormUrlencodedEditor
          bodyValues={body.body}
          setBodyValues={(bodyValues) => setBody({ ...body, body: bodyValues })}
        />
      )}
    </Stack>
  )
}
