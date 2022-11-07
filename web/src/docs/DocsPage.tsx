import { Markdown } from 'src/components/utils/Markdown'
import { useCurrentContent } from 'src/layouts/Docs/DocsLayout'

export const DocsPage = () => {
  const currentContent = useCurrentContent()

  if (currentContent === null) {
    return <></>
  }

  return <Markdown>{currentContent.markdown}</Markdown>
}
