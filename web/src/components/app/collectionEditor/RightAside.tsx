import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import CodeIcon from '@mui/icons-material/Code'
import CommentIcon from '@mui/icons-material/Comment'
import { Box, IconButton, Stack, Tooltip, useTheme } from '@mui/material'

import { RESTCodeGenerator } from '../CodeGenerator/RESTCodeGenerator'

import { focusedElementVar } from './reactives'
import { RESTHistory } from './RESTHistory'

type RightAsideProps = {
  setShowRightAside: (showRightAside: boolean) => void
  showRightAside: boolean
}

type AsideType = 'code' | 'restHistory' | null

export const RightAside = ({
  setShowRightAside,
  showRightAside,
}: RightAsideProps) => {
  const theme = useTheme()
  const focusedElement = useReactiveVar(focusedElementVar)
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
    if (focusedElement?.__typename !== 'LocalRESTRequest') {
      if (activeRightAside === 'code') {
        setActiveRightAside(null)
        setShowRightAside(false)
      }
    }
  }, [activeRightAside, focusedElement, setActiveRightAside, setShowRightAside])

  return (
    <Stack
      direction="row"
      sx={{
        height: '100%',
        width: '100%',
      }}
    >
      <Stack
        spacing={2}
        sx={{
          width: '50px',
          height: '100%',
          borderRight: activeRightAside ? '1px solid' : 'none',
          borderColor: theme.palette.divider,
        }}
      >
        {focusedElement?.__typename === 'LocalRESTRequest' && (
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
        focusedElement?.__typename === 'LocalRESTRequest' &&
        activeRightAside === 'code' && <RESTCodeGenerator />}
      {showRightAside &&
        focusedElement?.__typename === 'LocalRESTRequest' &&
        activeRightAside === 'restHistory' && <RESTHistory />}
    </Stack>
  )
}
