import { useMemo } from 'react'

import { Button } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { Link, routes } from '@redwoodjs/router'

type SignUpThenBuyButtonProps = {
  size: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  buyRoute: string
  params?: Record<string, string>
}

export const SignUoThenBuyButton = ({
  size,
  fullWidth,
  buyRoute,
  params,
}: SignUpThenBuyButtonProps) => {
  const { isAuthenticated } = useAuth()

  const fullBuyRoute = useMemo(
    () => `${buyRoute}${params ? `?${new URLSearchParams(params)}` : ''}`,
    [buyRoute, params]
  )

  return isAuthenticated ? (
    <Link
      to={fullBuyRoute}
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
          Purchase
        </span>
      </Button>
    </Link>
  ) : (
    <Link
      to={routes.signup({
        redirectTo: fullBuyRoute,
      })}
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
          Sign Up then Buy
        </span>
      </Button>
    </Link>
  )
}
