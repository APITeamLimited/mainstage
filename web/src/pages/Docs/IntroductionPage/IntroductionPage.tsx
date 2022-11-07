import { Markdown } from 'src/components/utils/Markdown'
import { useCurrentContent } from 'src/layouts/Docs/DocsLayout'

const DocsIntroductionPage = () => {
  const currentContent = useCurrentContent()

  return <Markdown>{currentContent?.markdown ?? ''}</Markdown>
}

export default DocsIntroductionPage
