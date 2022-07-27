import { Buffer } from 'buffer'

import { useState, useEffect } from 'react'

import { Chip, Grid, Stack, Typography } from '@mui/material'

import { LocalRESTResponse } from 'src/contexts/reactives'
import { codeFormatter } from 'src/utils/codeFormatter'
import { parseRESTResponseBody } from 'src/utils/parseRESTResponseBody'

import { MonacoEditor } from '../MonacoEditor'

import { HTMLViewer } from './HTMLViewer'
import { RawViewer } from './RawViewer'

type BodyPanelProps = {
  response: LocalRESTResponse
}

const TABS = ['Pretty', 'Raw', 'Preview']

export const BodyPanel = ({ response }: BodyPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [rawBody, setRawBody] = useState('')

  if (response.type !== 'Success' && response.type !== 'Fail') {
    throw `Invalid response type: ${response.type} BodyPanel can only be used with Success or Failure response types`
  }

  useEffect(() => {
    if (response.type === 'Success' || response.type === 'Fail') {
      setRawBody(parseRESTResponseBody(response))
    }
  }, [response])

  const handleTabChange = (newValue: number) => {
    setActiveTabIndex(newValue)
  }

  //console.log('BodyPanel', response)
  return (
    <Stack
      spacing={2}
      sx={{
        height: '100%',
      }}
    >
      <Grid container spacing={2} margin={0}>
        {TABS.map((tab, index) => (
          <Chip
            color="primary"
            key={index}
            label={
              <Typography
                sx={{
                  color:
                    activeTabIndex === index ? 'inherit' : 'text.secondary',
                }}
              >
                {tab}
              </Typography>
            }
            variant={activeTabIndex === index ? 'filled' : 'outlined'}
            onClick={() => handleTabChange(index)}
            size="small"
            sx={{
              marginRight: 1,
              marginBottom: 1,
              borderWidth: activeTabIndex === index ? undefined : 0,
            }}
          />
        ))}
      </Grid>
      <Stack
        justifyContent="flex-end"
        alignItems="center"
        width="100%"
        direction="row"
        spacing={1}
      ></Stack>
      {activeTabIndex === 0 && (
        <MonacoEditor
          language="plain"
          value={rawBody}
          readOnly
          scrollBeyondLastLine={false}
          wordWrap="on"
        />
      )}
      {activeTabIndex === 1 && (
        <RawViewer rawBody={rawBody} />
        // removed this as competitors are using monaco editor
        //<MonacoEditor
        //  language="plain"
        //  value={rawBody}
        //  readOnly
        //  scrollBeyondLastLine={false}
        //  wordWrap="on"
        ///>
      )}
      {activeTabIndex === 2 && <HTMLViewer html={rawBody} />}
    </Stack>
  )
}
