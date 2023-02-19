import type { Chapter, DocsPage } from '@apiteam/types/src'

export const GETTING_STARTED_CONTENT: (Chapter | DocsPage)[] = [
  {
    variant: 'chapter',
    slug: 'getting-started',
    title: 'Getting Started',
    markdown: require('./getting-started.md').default,
    content: [
      {
        variant: 'page',
        slug: 'dashboard',
        title: 'The Dashboard',
        markdown: require('./content/dashboard/dashboard.md').default,
      },
      // {
      //   variant: 'page',
      //   slug: 'sending-your-first-request',
      //   title: 'Sending Your First Request',
      //   markdown: require('./content/sending-your-first-request.md').default,
      // },
    ],
  },
]
