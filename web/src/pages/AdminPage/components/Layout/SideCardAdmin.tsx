import { Card, CardContent } from '@mui/material'

import { SideContentAdmin } from './SideContentAdmin'

export const SideCardAdmin = () => {
  return (
    <Card sx={{ minWidth: 280 }}>
      <CardContent>
        <SideContentAdmin />
      </CardContent>
    </Card>
  )
}
