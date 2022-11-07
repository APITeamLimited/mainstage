import type { Chapter, DocsPage } from '@apiteam/types'

export const INTRODUCTION_CONTENT: (Chapter | DocsPage)[] = [
  {
    variant: 'chapter',
    slug: 'getting-started',
    title: 'Getting Started',
    content: [
      {
        variant: 'page',
        title: 'Introduction',
        slug: 'introduction',
        markdown: require('./introduction.md').default,
      },
    ],
  },
]
