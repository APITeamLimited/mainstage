import { useEffect, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import jwt_decode, { JwtPayload } from 'jwt-decode'
import { GetBearerPubkey } from 'types/graphql'

import { CurrentUser } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

import { workspacesVar } from 'src/contexts/reactives'

const GET_BEARER_PUBKEY_QUERY = gql`
  query GetBearerPubkey {
    bearer
    publicKey
  }
`

type Bearer = JwtPayload & { userId: string }

type AuthenticatedEntityEngineProps = {
  currentUser: CurrentUser
  children?: React.ReactNode
}

export const AuthenticatedEntityEngine = ({
  currentUser,
  children,
}: AuthenticatedEntityEngineProps) => {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [bearer, setBearer] = useState<Bearer | null>(null)
  const [bearerExpiry, setBearerExpiry] = useState<number>(0)
  const workspaces = useReactiveVar(workspacesVar)

  // Get bearer token from gql query
  const { loading, error, data } = useQuery<GetBearerPubkey>(
    GET_BEARER_PUBKEY_QUERY,
    {
      skip: bearerExpiry > Date.now(),
    }
  )

  // Handle jwt_decode updates
  useEffect(() => {
    if (!data) return

    setPublicKey(data.publicKey)

    const decodedToken: Bearer = jwt_decode(data.bearer) as unknown as Bearer

    if (!decodedToken.exp) throw 'No expiry in bearer token'
    if (!decodedToken.userId) throw 'No userId in bearer token'

    setBearer(decodedToken)
    setBearerExpiry(decodedToken.exp * 1000)

    workspacesVar([
      ...workspaces.filter((workspace) => workspace.__typename !== 'User'),
      {
        __typename: 'User',
        id: currentUser.id,
        name: 'Personal Cloud',
      },
    ])
  }, [currentUser, data, error, loading, workspaces])

  // First run jobs
  useEffect(() => {
    // First run login here
  }, [])

  if (error) {
    throw error
  }

  if (loading || !publicKey || !bearer || bearerExpiry < Date.now()) {
    return <></>
  }

  return <>{children}</>
}
