import { useCurrentContent } from 'src/layouts/Docs/DocsLayout'

import { DocsMarkdown } from '../components/DocsMarkdown'

export const DocsPage = () => {
  const currentContent = useCurrentContent()

  if (currentContent === null) {
    return <></>
  }

  return <DocsMarkdown>{currentContent.markdown}</DocsMarkdown>
}
