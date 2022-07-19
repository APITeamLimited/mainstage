import { useState } from 'react'

import CodeIcon from '@mui/icons-material/Code'
import { IconButton, Stack, Tooltip, useTheme } from '@mui/material'

type RightAsideProps = {
  setShowRightAside: (showRightAside: boolean) => void
  showRightAside: boolean
}

type AsideType = 'code' | null

export const RightAside = ({
  setShowRightAside,
  showRightAside,
}: RightAsideProps) => {
  const theme = useTheme()
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

  return (
    <Stack
      spacing={2}
      sx={{
        width: '50px',
        height: '100%',
        borderRight: '1px solid',
        borderColor: theme.palette.divider,
      }}
    >
      <Tooltip title="Generate Code">
        <IconButton
          size="large"
          color={activeRightAside === 'code' ? 'primary' : 'inherit'}
          onClick={() => handleButtonClick('code')}
        >
          <CodeIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  )
}
