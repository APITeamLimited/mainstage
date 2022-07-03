import humanize from 'humanize-string'

import { Link, routes, navigate } from '@redwoodjs/router'
import { useMutation } from '@redwoodjs/web'
import { toast } from '@redwoodjs/web/toast'

const DELETE_USER_MUTATION = gql`
  mutation DeleteUserMutation($id: String!) {
    deleteUser(id: $id) {
      id
    }
  }
`

const formatEnum = (values: string | string[] | null | undefined) => {
  if (values) {
    if (Array.isArray(values)) {
      const humanizedValues = values.map((value) => humanize(value))
      return humanizedValues.join(', ')
    } else {
      return humanize(values as string)
    }
  }
}

const jsonDisplay = (obj) => {
  return (
    <pre>
      <code>{JSON.stringify(obj, null, 2)}</code>
    </pre>
  )
}

const timeTag = (datetime) => {
  return (
    datetime && (
      <time dateTime={datetime} title={datetime}>
        {new Date(datetime).toUTCString()}
      </time>
    )
  )
}

const checkboxInputTag = (checked) => {
  return <input type="checkbox" checked={checked} disabled />
}

const User = ({ user }) => {
  const [deleteUser] = useMutation(DELETE_USER_MUTATION, {
    onCompleted: () => {
      toast.success('User deleted')
      navigate(routes.users())
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  const onDeleteClick = (id) => {
    if (confirm('Are you sure you want to delete user ' + id + '?')) {
      deleteUser({ variables: { id } })
    }
  }

  return (
    <>
      <div className="rw-segment">
        <header className="rw-segment-header">
          <h2 className="rw-heading rw-heading-secondary">User {user.id} Detail</h2>
        </header>
        <table className="rw-table">
          <tbody>
            <tr>
              <th>Id</th>
              <td>{user.id}</td>
            </tr><tr>
              <th>First name</th>
              <td>{user.firstName}</td>
            </tr><tr>
              <th>Last name</th>
              <td>{user.lastName}</td>
            </tr><tr>
              <th>Email</th>
              <td>{user.email}</td>
            </tr><tr>
              <th>Created at</th>
              <td>{timeTag(user.createdAt)}</td>
            </tr><tr>
              <th>Updated at</th>
              <td>{timeTag(user.updatedAt)}</td>
            </tr><tr>
              <th>Is support</th>
              <td>{checkboxInputTag(user.isSupport)}</td>
            </tr><tr>
              <th>Email verified</th>
              <td>{checkboxInputTag(user.emailVerified)}</td>
            </tr><tr>
              <th>Short bio</th>
              <td>{user.shortBio}</td>
            </tr><tr>
              <th>Profile picture</th>
              <td>{user.profilePicture}</td>
            </tr><tr>
              <th>Hashed password</th>
              <td>{user.hashedPassword}</td>
            </tr><tr>
              <th>Salt</th>
              <td>{user.salt}</td>
            </tr><tr>
              <th>Reset token</th>
              <td>{user.resetToken}</td>
            </tr><tr>
              <th>Reset token expires at</th>
              <td>{timeTag(user.resetTokenExpiresAt)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <nav className="rw-button-group">
        <Link
          to={routes.editUser({ id: user.id })}
          className="rw-button rw-button-blue"
        >
          Edit
        </Link>
        <button
          type="button"
          className="rw-button rw-button-red"
          onClick={() => onDeleteClick(user.id)}
        >
          Delete
        </button>
      </nav>
    </>
  )
}

export default User
