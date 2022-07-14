import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import {
  Chip,
  Grid,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  Box,
} from '@mui/material'

import {
  ValidContentTypes,
  knownContentTypes,
  RESTReqBody,
} from 'src/contexts/reactives'

import { MonacoEditor } from '../MonacoEditor'

type BodyPanelProps = {
  body: RESTReqBody
  onBodyChange: (newBody: RESTReqBody) => void
}

export const BodyPanel = ({ body, onBodyChange }: BodyPanelProps) => {
  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
        margin: 0,
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="space-between"
        alignItems="flex-end"
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
                  onBodyChange({
                    ...body,
                    contentType: knownContentType as ValidContentTypes,
                  } as RESTReqBody)
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
        <Tooltip title="Delete All">
          <IconButton onClick={() => undefined}>
            <DeleteSweepIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      <MonacoEditor value="" language="json" onChange={() => {}} />
    </Stack>
  )
}
