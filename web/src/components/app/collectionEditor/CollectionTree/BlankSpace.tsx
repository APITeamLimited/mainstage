import { Box, useTheme } from '@mui/material'

import { NodeItem } from './Node'

type BlankSpaceProps = {
  parentNode: NodeItem
  endSpace?: boolean
}

export const BlankSpace = ({
  parentNode,
  endSpace = false,
}: BlankSpaceProps) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.alternate.dark,
        height: endSpace ? '2em' : '0.5em',
      }}
    />
  )
}
