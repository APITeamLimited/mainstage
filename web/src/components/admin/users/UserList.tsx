import { List, Datagrid, TextField, DateField, BooleanField } from 'react-admin'

export const UserList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="firstName" />
      <TextField source="lastName" />
      <TextField source="email" />
      <DateField source="createdAt" />
      <BooleanField source="emailVerified" />
    </Datagrid>
  </List>
)
