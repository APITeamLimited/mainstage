import type { Chapter, DocsPage } from '@apiteam/types/src/docs/docs-lib'

import { INTRODUCTION_CONTENT } from './getting-started'

const DOCS_CONTENT: (Chapter | DocsPage)[] = [
  {
    variant: 'chapter',
    title: 'APITeam Docs',
    slug: 'docs',
    markdown: require('./welcome.md').default,
    content: [...INTRODUCTION_CONTENT],
  },
]

export default DOCS_CONTENT
