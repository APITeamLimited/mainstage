import {
  Show,
  TextField,
  DateField,
  RichTextField,
  BooleanField,
  UrlField,
} from 'react-admin'

export const UserShow = () => (
  <Show>
    <TextField source="id" />
    <TextField source="firstName" />
    <TextField source="lastName" />
    <TextField source="email" />
    <DateField source="createdAt" />
    <DateField source="updatedAt" />
    <BooleanField source="isAdmin" />
    <BooleanField source="emailVerified" />
    <RichTextField source="shortBio" />
    <UrlField source="profilePicture" />
  </Show>
)
