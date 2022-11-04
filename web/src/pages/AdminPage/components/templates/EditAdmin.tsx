import { ReactNode } from 'react'

import { Button, Divider, Stack, Typography } from '@mui/material'
import { Edit, SimpleForm } from 'react-admin'
import { useNavigate } from 'react-router-dom'

import { ADMIN_FORM_SPACING } from '../../constants'

type EditAdminProps = {
  title: string
  children?: ReactNode
}

export const EditAdmin = ({ title, children }: EditAdminProps) => {
  const navigate = useNavigate()

  return (
    <Edit title={title}>
      <SimpleForm>
        <Stack spacing={ADMIN_FORM_SPACING} sx={{ width: '100%' }}>
          <Stack
            spacing={ADMIN_FORM_SPACING}
            sx={{ width: '100%' }}
            justifyContent="space-between"
            direction="row"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold">
              {title}
            </Typography>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate('..')}
              size="small"
            >
              Back
            </Button>
          </Stack>
          <Divider flexItem />
          {children}
        </Stack>
      </SimpleForm>
    </Edit>
  )
}
