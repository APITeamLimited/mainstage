import { useState, createContext, useContext, useEffect } from 'react'

import { useLocation } from '@redwoodjs/router'

export type DocHeading = {
  title: string
  ref: React.RefObject<HTMLHeadingElement>
  depth: number
}

export const RegisterDocHeadingContext = createContext<
  (heading: DocHeading) => void
>(() => {})
export const useRegisterDocHeading = () => useContext(RegisterDocHeadingContext)

const DocHeadingsContext = createContext<DocHeading[]>([])
export const useDocsHeadings = () => useContext(DocHeadingsContext)

type RegisterDocHeadingContextProps = {
  children?: React.ReactNode
}

export const DocHeadingsProvider = ({
  children,
}: RegisterDocHeadingContextProps) => {
  const [docHeadings, setDocHeadings] = useState<DocHeading[]>([])

  const { pathname } = useLocation()

  const registerDocHeading = (heading: DocHeading) => {
    setDocHeadings((prev) => [...prev, heading])
  }

  // If route changes, reset the headings
  useEffect(() => {
    setDocHeadings([])
  }, [pathname])

  return (
    <RegisterDocHeadingContext.Provider value={registerDocHeading}>
      <DocHeadingsContext.Provider value={docHeadings}>
        {children}
      </DocHeadingsContext.Provider>
    </RegisterDocHeadingContext.Provider>
  )
}
