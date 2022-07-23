import { useEffect, useState } from 'react'

import * as JWT from 'jsonwebtoken'

import { CurrentUser } from '@redwoodjs/auth'
import { useQuery } from '@redwoodjs/web'

const issuer = 'apiteam.cloud'
const audience = 'apiteam.cloud'

const GET_BEARER_PUBKEY_QUERY = gql`
  query GetBearerPubkey {
    bearer
    publicKey
  }
`

type GetBearerPubkeyType = {
  bearer: string
  publicKey: string
}

type Bearer = JWT.JwtPayload & { userId: string }

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

  // Get bearer token from gql query
  const { loading, error, data } = useQuery<GetBearerPubkeyType>(
    GET_BEARER_PUBKEY_QUERY,
    {
      skip: bearerExpiry > Date.now(),
    }
  )

  // Handle JWT updates
  useEffect(() => {
    if (!data && !loading) throw 'No bearer token was received from gql query'
    if (!data) return

    setPublicKey(data.publicKey)

    const decodedToken: Bearer = JWT.verify(data.bearer, data.publicKey, {
      issuer,
      audience,
      complete: true,
    }) as unknown as Bearer

    if (!decodedToken.exp) throw 'No expiry in bearer token'
    if (!decodedToken.userId) throw 'No userId in bearer token'

    setBearer(decodedToken)
    setBearerExpiry(decodedToken.exp * 1000)
  }, [data, error, loading])

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
