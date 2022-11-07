import { createContext, useContext, useEffect, useState } from 'react'

import type { DocsSearchIndex } from '@apiteam/docs/src'
import type { Chapter, DocsPage } from '@apiteam/types/src/docs/docs-lib'

export type DocsContent = (DocsPage | Chapter)[]

const importDocsContent = async () =>
  (await import('@apiteam/docs/src')) as {
    DOCS_CONTENT: DocsContent
    DOCS_SEARCH_INDEX: DocsSearchIndex
  }

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DocsContentContext = createContext<DocsContent>(null)
export const useDocsContent = () => useContext(DocsContentContext)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DocsSearchIndexContext = createContext<DocsSearchIndex>(null)
export const useDocsSearchIndex = () => useContext(DocsSearchIndexContext)

export const DocsContentProvider = ({
  children,
}: {
  children?: React.ReactNode
}) => {
  const [docsContent, setDocsContent] = useState<DocsContent | null>(null)
  const [docsSearchIndex, setDocsSearchIndex] =
    useState<DocsSearchIndex | null>(null)

  useEffect(() => {
    const importContents = async () => {
      const importedContent = await importDocsContent()
      console.log(importedContent)
      setDocsContent(importedContent.DOCS_CONTENT)
      setDocsSearchIndex(importedContent.DOCS_SEARCH_INDEX)
    }
    importContents()
  }, [])

  if (!docsContent || !docsSearchIndex) return <></>

  return (
    <DocsContentContext.Provider value={docsContent}>
      <DocsSearchIndexContext.Provider value={docsSearchIndex}>
        {children}
      </DocsSearchIndexContext.Provider>
    </DocsContentContext.Provider>
  )
}
