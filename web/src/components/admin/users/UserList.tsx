import { List, Datagrid, TextField, DateField, BooleanField } from 'react-admin'
import React from 'react'

export const UserList = () => (
  <List>
    <Datagrid>
      <TextField source="id" />
      <TextField source="firstName" />
      <DateField source="lastName" />
      <TextField source="email" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
)
