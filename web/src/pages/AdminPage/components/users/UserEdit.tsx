import { Divider, Stack } from '@mui/material'
import { TextInput, DateInput, BooleanInput } from 'react-admin'

import { ADMIN_FORM_SPACING } from '../../constants'
import { EditAdmin } from '../templates/EditAdmin'

export const UserEdit = () => (
  <EditAdmin title="Edit User">
    <TextInput
      disabled
      source="id"
      label="ID"
      fullWidth
      sx={{
        margin: 0,
      }}
    />
    <TextInput source="firstName" label="First Name" fullWidth />
    <TextInput source="lastName" label="Last Name" fullWidth />
    <TextInput source="email" label="Email" fullWidth />
    <TextInput source="shortBio" label="Short Bio" fullWidth />
    <BooleanInput source="emailVerified" label="Email Verified" fullWidth />
    <Divider flexItem />
    <Stack direction="row" spacing={ADMIN_FORM_SPACING}>
      <DateInput disabled source="createdAt" label="Created At" />
      <DateInput disabled source="updatedAt" label="Updated At" />
    </Stack>
    <BooleanInput disabled source="isAdmin" label="Is Admin" fullWidth />
  </EditAdmin>
)
