import { Markdown } from 'src/components/utils/Markdown'
import { useCurrentContent } from 'src/layouts/Docs/DocsLayout'

const DocsWelcomePage = () => {
  const currentContent = useCurrentContent()

  return <Markdown>{currentContent?.markdown ?? ''}</Markdown>
}

export default DocsWelcomePage
