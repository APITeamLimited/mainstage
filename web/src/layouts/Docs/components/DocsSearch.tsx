import { Search } from 'src/components/Search'
import { useDocsSearchIndex } from 'src/contexts/imports/docs-content-provider'

export const DocsSearch = () => {
  const docsSearchIndex = useDocsSearchIndex()

  return (
    <Search
      prompt="Search docs"
      searchIndex={docsSearchIndex}
      namespace="docs"
    />
  )
}
