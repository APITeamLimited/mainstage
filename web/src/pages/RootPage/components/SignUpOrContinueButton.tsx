import { Button } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'

export const SignUpOrContinueButton = () => {
  const { isAuthenticated } = useAuth()

  return isAuthenticated ? (
    <Link
      to={routes.dashboard()}
      style={{
        textDecoration: 'none',
      }}
    >
      <Button
        variant="contained"
        color="success"
        size="large"
        sx={{
          fontSize: 'normal',
        }}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          Go to Dashboard
        </span>
      </Button>
    </Link>
  ) : (
    <Link
      to={routes.signup()}
      style={{
        textDecoration: 'none',
      }}
    >
      <Button variant="contained" color="primary" size="large">
        <span
          style={{
            whiteSpace: 'nowrap',
          }}
        >
          Sign Up
        </span>
      </Button>
    </Link>
  )
}
