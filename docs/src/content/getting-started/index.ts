import type { Chapter, DocsPage } from '@apiteam/types/src'

export const GETTING_STARTED_CONTENT: (Chapter | DocsPage)[] = [
  {
    variant: 'chapter',
    slug: 'getting-started',
    title: 'Getting Started',
    markdown: require('./getting-started.md').default,
    content: [],
  },
]
