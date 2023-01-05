import { useLocation } from '@redwoodjs/router'

export const useQueryParams = () => {
  const { search } = useLocation()

  return new URLSearchParams(search)
}
