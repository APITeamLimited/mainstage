import { useEffect } from 'react'

type ScrollbarManagerProps = {
  enableCustomScrollbars: boolean
  children: React.ReactNode
}

export const ScrollbarManager = ({
  enableCustomScrollbars,
  children,
}: ScrollbarManagerProps) => {
  useEffect(() => {
    document.documentElement.setAttribute(
      'app-scrollbars',
      enableCustomScrollbars ? 'enabled' : 'disabled'
    )
  }, [enableCustomScrollbars])

  return <>{children}</>
}
