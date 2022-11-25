import { Button } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'

type SignUpOrContinueButtonProps = {
  size: 'small' | 'medium' | 'large'
  fullWidth?: boolean
}

export const SignUpOrContinueButton = ({
  size,
  fullWidth,
}: SignUpOrContinueButtonProps) => {
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
        size={size}
        fullWidth={fullWidth}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            fontSize: 'normal',
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
      <Button
        variant="contained"
        color="primary"
        size={size}
        fullWidth={fullWidth}
      >
        <span
          style={{
            whiteSpace: 'nowrap',
            fontSize: 'normal',
          }}
        >
          Sign Up for Free
        </span>
      </Button>
    </Link>
  )
}
