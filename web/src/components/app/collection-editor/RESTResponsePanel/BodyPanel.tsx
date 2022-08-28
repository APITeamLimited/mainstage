import { useState, useEffect } from 'react'

import { Chip, Grid, Stack, Typography } from '@mui/material'
import { Response } from 'k6/http'

import { parseRESTResponseBody } from 'src/utils/parseRESTResponseBody'

import { SecondaryChips } from '../../utils/SecondaryChips'
import { MonacoEditor } from '../MonacoEditor'

import { HTMLViewer } from './HTMLViewer'
import { RawViewer } from './RawViewer'

type BodyPanelProps = {
  response: Response
  setActionArea: (actionArea: React.ReactNode) => void
}

const TABS = ['Pretty', 'Raw', 'Preview']

// removes preceeding and ending newlines
const removePreceedingNewlines = (str: string) => {
  return str.replace(/^\n+/, '').replace(/\n+$/, '')
}

export const BodyPanel = ({ response, setActionArea }: BodyPanelProps) => {
  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [rawBody, setRawBody] = useState('')

  const contentType = response.headers['Content-Type']
    ? response.headers['Content-Type'].toString().toLowerCase().split(';')[0] ||
      'text/plain'
    : 'text/plain'

  useEffect(() => {
    setActionArea(<></>)
    setRawBody(parseRESTResponseBody(response))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response])

  return (
    <>
      <SecondaryChips
        names={TABS}
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
      {activeTabIndex === 0 && (
        <MonacoEditor
          language={contentType}
          value={removePreceedingNewlines(rawBody)}
          readOnly
          wordWrap="on"
        />
      )}
      {activeTabIndex === 1 && (
        //<RawViewer rawBody={rawBody} />
        // removed this as competitors are using monaco editor
        <MonacoEditor language="plain" value={rawBody} readOnly wordWrap="on" />
      )}
      {activeTabIndex === 2 && <HTMLViewer html={rawBody} />}
    </>
  )
}
