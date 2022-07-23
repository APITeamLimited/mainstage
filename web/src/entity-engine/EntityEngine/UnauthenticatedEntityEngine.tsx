import { useEffect, useState } from 'react'

type UnauthenticatedEntityEngineProps = {
  children?: React.ReactNode
}

export const UnauthenticatedEntityEngine = ({
  children,
}: UnauthenticatedEntityEngineProps) => {
  // First run jobs
  useEffect(() => {}, [])

  return <>{children}</>
}
