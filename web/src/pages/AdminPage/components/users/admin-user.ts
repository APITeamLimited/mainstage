import { ValidAdmin } from '../data-provider'

import { UserEdit } from './UserEdit'
import { UserList } from './UserList'

export const USER_ADMIN_GET_LIST_QUERY = gql`
  query AdminUserGetList(input: AdminUserGetListInput!) {
    adminUserGetList(input: $input) {
      data {
        ...AllUserFields
      }
      total
    }
  }
`

export const ADMIN_USER_GET_ONE_QUERY = gql`
  query AdminUserGetOne(input: AdminUserGetOneInput!) {
    adminUserGetOne(input: $input) {
      data {
        ...AllUserFields
      }
    }
  }
`

export const ADMIN_USER_GET_MANY_QUERY = gql`
  query AdminUserGetMany(input: AdminUserGetManyInput!) {
    adminUserGetMany(input: $input) {
      data {
        ...AllUserFields
      }
    }
  }
`

export const ADMIN_USER_GET_MANY_REFERENCE_QUERY = gql`
  query AdminUserGetManyReference(
    input: AdminUserGetManyReferenceInput!
  ) {
    adminUsersReference(input: $input) {
      data {
        ...AllUserFields
      }
      total
    }
  }
`

export const ADMIN_USER_CREATE_MUTATION = gql`
  mutation AdminUserCreate($input: AdminUserCreateInput!) {
    adminUserCreate(input: $input) {
      data {
        ...AllUserFields
      }
    }
  }
`

export const ADMIN_USER_UPDATE_MUTATION = gql`
  mutation AdminUserUpdate($input: AdminUserUpdateInput!) {
    adminUserUpdate(input: $input) {
      data {
        ...AllUserFields
      }
    }
  }
`

export const ADMIN_USER_UPDATE_MANY_MUTATION = gql`
  mutation AdminUserUpdateMany($input: AdminUserUpdateManyInput!) {
    adminUserUpdateMany(input: $input) {
      data {
        id
      }
    }
  }
`

export const ADMIN_USER_DELETE_MUTATION = gql`
  mutation AdminUserDelete($input: AdminUserDeleteInput!) {
    adminUserDelete(input: $input) {
      data {
        ...AllUserFields
      }
    }
  }
`

const ADMIN_USER_DELETE_MANY_MUTATION = gql`
  mutation AdminUserDeleteMany($input: AdminUserDeleteManyInput!) {
    adminUserDeleteMany(input: $input) {
      data {
        id
      }
    }
  }
`

export const UserAdmin: ValidAdmin = {
  gqlName: 'adminUsers',
  displayName: 'User',
  displayNamePlural: 'Users',
  methods: {
    getList: {
      name: 'adminUserGetList',
      query: USER_ADMIN_GET_LIST_QUERY,
    },
    getOne: {
      name: 'adminUserGetOne',
      query: ADMIN_USER_GET_ONE_QUERY,
    },
    getMany: {
      name: 'adminUserGetMany',
      query: ADMIN_USER_GET_MANY_QUERY,
    },
    getManyReference: {
      name: 'adminUserGetManyReference',
      query: ADMIN_USER_GET_MANY_REFERENCE_QUERY,
    },
    update: {
      name: 'adminUserUpdate',
      mutation: ADMIN_USER_UPDATE_MUTATION,
    },
    updateMany: {
      name: 'adminUserUpdateMany',
      mutation: ADMIN_USER_UPDATE_MANY_MUTATION,
    },
    create: {
      name: 'adminUserCreate',
      mutation: ADMIN_USER_CREATE_MUTATION,
    },
    delete: {
      name: 'adminUserDelete',
      mutation: ADMIN_USER_DELETE_MUTATION,
    },
    deleteMany: {
      name: 'adminUserDeleteMany',
      mutation: ADMIN_USER_DELETE_MANY_MUTATION,
    },
  },
  admins: {
    list: UserList,
    edit: UserEdit,
  },
}
