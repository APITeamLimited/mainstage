import LanguageIcon from '@mui/icons-material/Language'
import { useTheme } from '@mui/material'

import { StatusBarItem } from './StatusBarItem'

export const OnlineIndicator = () => {
  const theme = useTheme()

  return (
    <StatusBarItem
      icon={LanguageIcon}
      text="Online"
      tooltip="Your work is being backed up to APITeam servers automatically"
    />
  )
}
