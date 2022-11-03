import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { Button } from '@mui/material'

import { navigate } from '@redwoodjs/router'

type CallToClickLinkProps = {
  text: string
  link: string
}

export const CallToClickLink = ({ text, link }: CallToClickLinkProps) => (
  <Button
    variant="outlined"
    onClick={() => navigate(link)}
    endIcon={<ChevronRightIcon />}
  >
    {text}
  </Button>
)
