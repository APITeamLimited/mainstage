import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Button } from '@mui/material'

import { navigate } from '@redwoodjs/router'

type CallToClickLinkProps = {
  text: string | JSX.Element
  link: string
  secondary?: boolean
}

export const CallToClickLink = ({
  text,
  link,
  secondary,
}: CallToClickLinkProps) => (
  <Button
    variant={secondary ? 'text' : 'contained'}
    sx={{
      fontWeight: secondary ? 'bold' : undefined,
    }}
    onClick={() => navigate(link)}
    endIcon={<ChevronRightIcon />}
  >
    {text}
  </Button>
)
