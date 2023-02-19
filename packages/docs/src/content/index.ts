import type { Chapter, DocsPage } from '@apiteam/types/src/docs/docs-lib'

import { GETTING_STARTED_CONTENT } from './getting-started'

export const DOCS_CONTENT: (Chapter | DocsPage)[] = [
  {
    variant: 'chapter',
    title: 'APITeam Docs',
    slug: 'docs',
    markdown: require('./docs.md').default,
    content: [...GETTING_STARTED_CONTENT],
  },
]
