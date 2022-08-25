import { ValidAdmin } from '../ReactAdmin'
import { UserList } from './UserList'
import { UserShow } from './UserShow'

export const USER_ADMIN_GET_LIST_QUERY = gql`
  query AdminUserGetList($page: Int, $perPage: Int) {
    adminUserGetList(page: $page, perPage: $perPage) {
      data {
        id
        firstName
        lastName
        email
        createdAt
        updatedAt
        isAdmin
        emailVerified
        shortBio
        profilePicture
      }
      total
      validUntil
    }
  }
`

export const ADMIN_USER_GET_ONE_QUERY = gql`
  query AdminUserGetOne($id: ID!) {
    adminUserGetOne(id: $id) {
      data {
        id
        firstName
        lastName
        email
        createdAt
        updatedAt
        isAdmin
        emailVerified
        shortBio
        profilePicture
      }
      total
      validUntil
    }
  }
`

export const ADMIN_USER_GET_MANY_QUERY = gql`
  query AdminUserGetMany($ids: [ID!]!) {
    adminUserGetMany(ids: $ids) {
      data {
        id
        firstName
        lastName
        email
        createdAt
        updatedAt
        isAdmin
        emailVerified
        shortBio
        profilePicture
      }
      total
      validUntil
    }
  }
`

export const ADMIN_USER_GET_MANY_REFERENCE_QUERY = gql`
  query AdminUserGetManyReference(
    $target: ID!
    $id: [ID!]!
    $page: Int
    $perPage: Int
  ) {
    adminUsersReference(
      target: $target
      ids: $ids
      page: $page
      perPage: $perPage
    ) {
      data {
        id
        firstName
        lastName
        email
        createdAt
        updatedAt
        isAdmin
        emailVerified
        shortBio
        profilePicture
      }
      total
      validUntil
    }
  }
`

export const UserAdmin: ValidAdmin = {
  gqlName: 'adminUsers',
  displayName: 'User',
  displayNamePlural: 'Users',
  methods: {
    getList: USER_ADMIN_GET_LIST_QUERY,
    getOne: ADMIN_USER_GET_ONE_QUERY,
    getMany: ADMIN_USER_GET_MANY_QUERY,
    getManyReference: ADMIN_USER_GET_MANY_REFERENCE_QUERY,
  },
  methodNames: {
    getList: 'adminUserGetList',
    getOne: 'adminUserGetOne',
    getMany: 'adminUserGetMany',
    getManyReference: 'adminUserReference',
  },
  admins: {
    list: UserList,
    show: UserShow,
  },
}
