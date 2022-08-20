import { useEffect, useState } from 'react'

import * as Y from 'yjs'

import { useReactiveVar } from '@apollo/client'
import CodeIcon from '@mui/icons-material/Code'
import CommentIcon from '@mui/icons-material/Comment'
import { Box, IconButton, Stack, Tooltip, useTheme } from '@mui/material'

import { focusedElementVar } from 'src/contexts/reactives/FocusedElement'

import { RESTCodeGenerator } from '../CodeGenerator/RESTCodeGenerator'

import { RESTHistory } from './RESTHistory'

type RightAsideProps = {
  setShowRightAside: (showRightAside: boolean) => void
  showRightAside: boolean
  collectionYMap: Y.Map<any>
}

type AsideType = 'code' | 'restHistory' | null

export const RightAside = ({
  setShowRightAside,
  collectionYMap,
  showRightAside,
}: RightAsideProps) => {
  const theme = useTheme()
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const [activeRightAside, setActiveRightAside] = useState<AsideType>(null)

  const handleButtonClick = (aside: AsideType) => {
    if (activeRightAside !== aside) {
      setActiveRightAside(aside)

      if (!showRightAside) {
        setShowRightAside(true)
      }
    } else {
      setActiveRightAside(null)
      setShowRightAside(false)
    }
  }

  useEffect(() => {
    if (
      focusedElementDict[collectionYMap.get('id')]?.get('__typename') !==
      'RESTRequest'
    ) {
      if (activeRightAside === 'code') {
        setActiveRightAside(null)
        setShowRightAside(false)
      }
    }
  }, [
    activeRightAside,
    collectionYMap,
    focusedElementDict,
    setActiveRightAside,
    setShowRightAside,
  ])

  const handleCloseAside = () => {
    setActiveRightAside(null)
    setShowRightAside(false)
  }

  return (
    <Stack
      direction="row"
      sx={{
        height: '100%',
        width: '100%',
        maxWidth: '100%',
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
        {focusedElementDict[collectionYMap.get('id')]?.get('__typename') ===
          'RESTRequest' && (
          <>
            <Tooltip title="Generate Code" placement="left">
              <IconButton
                size="large"
                color={activeRightAside === 'code' ? 'primary' : 'inherit'}
                onClick={() => handleButtonClick('code')}
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Request History" placement="left">
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
          </>
        )}
      </Stack>
      {showRightAside &&
        focusedElementDict[collectionYMap.get('id')]?.get('__typename') ===
          'RESTRequest' &&
        activeRightAside === 'code' && (
          <RESTCodeGenerator onCloseAside={handleCloseAside} />
        )}
      {showRightAside &&
        focusedElementDict[collectionYMap.get('id')]?.get('__typename') ===
          'RESTRequest' &&
        activeRightAside === 'restHistory' && (
          <RESTHistory
            onCloseAside={handleCloseAside}
            collectionYMap={collectionYMap}
          />
        )}
    </Stack>
  )
}
