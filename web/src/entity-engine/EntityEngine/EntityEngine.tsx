import { useAuth } from '@redwoodjs/auth'

import { AuthenticatedEntityEngine } from './AuthenticatedEntityEngine'
import { UnauthenticatedEntityEngine } from './UnauthenticatedEntityEngine'

type EntityEngineProps = {
  children?: React.ReactNode
}

export const EntityEngine = ({ children }: EntityEngineProps) => {
  const { currentUser, isAuthenticated } = useAuth()

  return isAuthenticated && currentUser ? (
    <AuthenticatedEntityEngine currentUser={currentUser}>
      {children}
    </AuthenticatedEntityEngine>
  ) : (
    <UnauthenticatedEntityEngine>{children}</UnauthenticatedEntityEngine>
  )
}
