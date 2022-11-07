import { createContext, useContext, useEffect, useState } from 'react'

import type { Chapter, DocsPage } from '@apiteam/types/src/docs/docs-lib'

export type DocsContent = (DocsPage | Chapter)[]

const importDocsContent = async () =>
  (await import('@apiteam/docs/src/content')) as {
    default: DocsContent
  }

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DocsContentContext = createContext<DocsContent>(null)
export const useDocsContent = () => useContext(DocsContentContext)

export const DocsContentProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [docsContent, setDocsContent] = useState<DocsContent | null>(null)

  useEffect(() => {
    const importContents = async () => {
      const importedContent = await importDocsContent()
      setDocsContent(importedContent.default)
    }
    importContents()
  }, [])

  if (!docsContent) return <></>

  return (
    <DocsContentContext.Provider value={docsContent}>
      {children}
    </DocsContentContext.Provider>
  )
}
