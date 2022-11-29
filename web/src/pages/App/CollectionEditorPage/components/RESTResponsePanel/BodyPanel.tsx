import { useState, useEffect, useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Tooltip, IconButton, Skeleton } from '@mui/material'
import { Response } from 'k6/http'

import { MonacoEditor } from 'src/components/app/MonacoEditor'
import { QuickActionArea } from 'src/components/app/utils/QuickActionArea'
import { SecondaryChips } from 'src/components/app/utils/SecondaryChips'
import { focusedResponseVar } from 'src/contexts/focused-response'
import { useHashSumModule } from 'src/contexts/imports'
import { codeFormatter } from 'src/utils/codeFormatter'
import { parseRESTResponseBody, getBodyContentType } from 'src/utils/rest-utils'

import { HTMLViewer } from './HTMLViewer'

type BodyPanelProps = {
  response: Response
  setActionArea: (actionArea: React.ReactNode) => void
  responseId: string
}

export const BodyPanel = ({
  response,
  setActionArea,
  responseId,
}: BodyPanelProps) => {
  const { default: hash } = useHashSumModule()

  const [activeTab, setActiveTab] = useState<string>('')
  const [rawBody, setRawBody] = useState('')
  const [calculatedBody, setCalculatedBody] = useState(false)

  const contentType = useMemo(() => getBodyContentType(response), [response])
  const [prettifiedBody, setPrettifiedBody] = useState<string | null>(null)
  const [prettyBodyName, setPrettyBodyName] = useState<string | null>(null)

  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const focusedResponseHash = useMemo(
    () => hash(focusedResponseDict),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseDict]
  )

  useEffect(() => {
    const customActions = []

    if (activeTab.startsWith('Pretty') && prettifiedBody) {
      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <IconButton
            onClick={() => navigator.clipboard.writeText(prettifiedBody)}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      )
    } else if (activeTab === 'Raw') {
      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <IconButton onClick={() => navigator.clipboard.writeText(rawBody)}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      )
    }

    setActionArea(<QuickActionArea customActions={customActions} />)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, prettifiedBody, rawBody])

  useEffect(() => {
    const rawBody = parseRESTResponseBody(response)
    setRawBody(rawBody)

    const performAsync = async () => {
      if (contentType === 'application/json') {
        setPrettifiedBody(await codeFormatter(rawBody, 'json'))
        setPrettyBodyName('JSON')
      } else if (contentType === 'application/xml') {
        setPrettifiedBody(await codeFormatter(rawBody, 'xml'))
        setPrettyBodyName('XML')
      } else if (contentType === 'text/html') {
        setPrettifiedBody(await codeFormatter(rawBody, 'html'))
        setPrettyBodyName('HTML')
      } else {
        setPrettifiedBody(null)
      }

      setCalculatedBody(true)
    }

    performAsync()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response])

  const chipNames = useMemo(() => {
    const base =
      prettifiedBody && prettyBodyName ? [`Pretty (${prettyBodyName})`] : []
    base.push('Raw')

    if (contentType === 'text/html') {
      base.push('HTML Viewer')
    }

    setActiveTab(base[0])

    return base
  }, [prettifiedBody, prettyBodyName, contentType])

  return calculatedBody ? (
    <>
      <SecondaryChips
        names={chipNames}
        value={chipNames.indexOf(activeTab) ?? 0}
        onChange={(newIndex) => setActiveTab(chipNames[newIndex])}
      />
      {activeTab === `Pretty (${prettyBodyName})` && prettifiedBody && (
        <MonacoEditor
          language={contentType}
          value={prettifiedBody}
          readOnly
          wordWrap="on"
          namespace={responseId}
          key={focusedResponseHash}
        />
      )}
      {activeTab === 'Raw' && (
        <MonacoEditor
          language="plain"
          value={rawBody}
          readOnly
          wordWrap="on"
          namespace={responseId}
          key={focusedResponseHash}
        />
      )}
      {activeTab === 'HTML Viewer' && <HTMLViewer html={rawBody} />}
    </>
  ) : (
    <Skeleton />
  )
}
