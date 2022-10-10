/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import CodeIcon from '@mui/icons-material/Code'
import CommentIcon from '@mui/icons-material/Comment'
import InfoIcon from '@mui/icons-material/Info'
import { IconButton, Paper, Stack, Tooltip, useTheme } from '@mui/material'
import type { Map as YMap } from 'yjs'

import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useYJSModule } from 'src/contexts/imports'
import {
  focusedElementVar,
  getFocusedElementKey,
} from 'src/contexts/reactives/FocusedElement'
import { useYMap } from 'src/lib/zustand-yjs'

import { AboutAside, getPrettyInfoTitle } from './AboutAside'
import { RESTCodeGenerator } from './CodeGenerator/RESTCodeGenerator'
import { RESTHistory } from './RESTHistory'

type RightAsideProps = {
  setShowRightAside: (showRightAside: boolean) => void
  showRightAside: boolean
  collectionYMap: YMap<any>
}

type AsideType = 'code' | 'restHistory' | null | 'info'

export const RightAside = ({
  setShowRightAside,
  collectionYMap,
  showRightAside,
}: RightAsideProps) => {
  const Y = useYJSModule()

  const theme = useTheme()
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const [activeRightAside, setActiveRightAside] = useState<AsideType>(null)
  const activeEnvironmentYMap = useActiveEnvironmentYMap()

  const collectionHook = useYMap(collectionYMap)

  const focusedElement = useMemo(
    () => focusedElementDict[getFocusedElementKey(collectionYMap)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedElementDict, collectionHook]
  ) as YMap<any> | undefined

  const handleButtonClick = (aside: AsideType) => {
    if (activeRightAside !== aside) {
      setActiveRightAside(aside)
      setShowRightAside(true)

      if (!showRightAside) {
        setShowRightAside(true)
      }
    } else {
      setActiveRightAside(null)
      setShowRightAside(false)
    }
  }

  useEffect(() => {
    const focusedTypename = focusedElement?.get('__typename')

    if (
      focusedTypename !== 'Collection' &&
      focusedTypename !== 'Folder' &&
      focusedTypename !== 'RESTRequest'
    ) {
      setActiveRightAside(null)
      setShowRightAside(false)
    }
  }, [
    activeRightAside,
    collectionHook,
    focusedElement,
    setActiveRightAside,
    setShowRightAside,
  ])

  const handleCloseAside = () => {
    setActiveRightAside(null)
    setShowRightAside(false)
  }

  const prettyInfoName = useMemo(
    () => (focusedElement ? getPrettyInfoTitle(focusedElement) : undefined),
    [focusedElement]
  )

  return (
    <Paper
      sx={{
        height: '100%',
        margin: 0,
        padding: 0,
        width: showRightAside ? '100%' : '50px',
        maxWidth: showRightAside ? '100%' : '50px',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'absolute',
        right: 0,
      }}
      elevation={0}
    >
      <Stack
        direction="row"
        sx={{
          height: '100%',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            width: '50px',
            height: '100%',
            borderRight: activeRightAside ? '1px solid' : 'none',
            borderColor: theme.palette.divider,
            paddingY: 1,
          }}
        >
          {focusedElement?.get('__typename') === 'RESTRequest' && (
            <>
              <Tooltip title="Response History" placement="left">
                <IconButton
                  size="large"
                  color={
                    activeRightAside === 'restHistory' ? 'primary' : 'inherit'
                  }
                  onClick={() => handleButtonClick('restHistory')}
                >
                  <CommentIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Generate Code" placement="left">
                <IconButton
                  size="large"
                  color={activeRightAside === 'code' ? 'primary' : 'inherit'}
                  onClick={() => handleButtonClick('code')}
                >
                  <CodeIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          {prettyInfoName && (
            <Tooltip title={prettyInfoName} placement="left">
              <IconButton
                size="large"
                color={activeRightAside === 'info' ? 'primary' : 'inherit'}
                onClick={() => handleButtonClick('info')}
              >
                <InfoIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
        {showRightAside &&
          focusedElement?.get('__typename') === 'RESTRequest' &&
          activeRightAside === 'restHistory' && (
            <RESTHistory
              onCloseAside={handleCloseAside}
              collectionYMap={collectionYMap}
            />
          )}
        {showRightAside &&
          focusedElement?.get('__typename') === 'RESTRequest' &&
          activeRightAside === 'code' && (
            <RESTCodeGenerator
              requestYMap={focusedElement}
              onCloseAside={handleCloseAside}
              activeEnvironmentYMap={activeEnvironmentYMap}
              collectionYMap={collectionYMap}
            />
          )}
        {focusedElement && showRightAside && activeRightAside === 'info' && (
          <AboutAside
            onCloseAside={handleCloseAside}
            itemYMap={focusedElement}
          />
        )}
      </Stack>
    </Paper>
  )
}
