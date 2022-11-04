import { Drawer } from '@mui/material'

import { SideContentAdmin } from './SideContentAdmin'

type SideBarAdminProps = {
  onClose: () => void
  open: boolean
  variant: 'permanent' | 'persistent' | 'temporary' | undefined
}

export const SideBarAdmin = ({
  open,
  variant,
  onClose,
}: SideBarAdminProps): JSX.Element => {
  return (
    <Drawer
      anchor="left"
      onClose={() => onClose()}
      open={open}
      variant={variant}
      sx={{
        '& .MuiPaper-root': {
          width: '100%',
          maxWidth: 280,
        },
      }}
    >
      <SideContentAdmin onClose={onClose} />
    </Drawer>
  )
}
