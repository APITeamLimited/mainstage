import { useState, useEffect, useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import { Tooltip, IconButton, Box } from '@mui/material'
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
}

export const BodyPanel = ({ response, setActionArea }: BodyPanelProps) => {
  const { default: hash } = useHashSumModule()

  const [activeTabIndex, setActiveTabIndex] = useState(0)
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

    if (activeTabIndex === 0 && prettifiedBody) {
      customActions.push(
        <Tooltip title="Copy All" key="Copy All">
          <IconButton
            onClick={() => navigator.clipboard.writeText(prettifiedBody)}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      )
    } else if (
      (activeTabIndex === 1 && prettifiedBody) ||
      (activeTabIndex === 0 && !prettifiedBody)
    ) {
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
  }, [activeTabIndex, prettifiedBody, rawBody])

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
        setActiveTabIndex(1)
        setPrettifiedBody(null)
      }

      setCalculatedBody(true)
    }

    performAsync()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response])

  return calculatedBody ? (
    <>
      <SecondaryChips
        names={
          prettifiedBody && prettyBodyName
            ? [`Pretty (${prettyBodyName})`, 'Raw', 'Preview']
            : ['Raw', 'Preview']
        }
        value={activeTabIndex}
        onChange={setActiveTabIndex}
      />
      {activeTabIndex === 0 && prettifiedBody && (
        <MonacoEditor
          language={contentType}
          value={prettifiedBody}
          readOnly
          wordWrap="on"
          namespace={`${response.url}-0`}
          key={focusedResponseHash}
        />
      )}
      {((activeTabIndex === 1 && prettifiedBody) ||
        (activeTabIndex === 0 && !prettifiedBody)) && (
        //<RawViewer rawBody={rawBody} />
        // removed this as competitors are using monaco editor
        <MonacoEditor
          language="plain"
          value={rawBody}
          readOnly
          wordWrap="on"
          namespace={`${response.url}-1`}
          key={focusedResponseHash}
        />
      )}
      {((activeTabIndex === 2 && prettifiedBody) ||
        (activeTabIndex === 1 && !prettifiedBody)) && (
        <HTMLViewer html={rawBody} />
      )}
    </>
  ) : (
    <></>
  )
}
