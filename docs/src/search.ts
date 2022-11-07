import { DocsPage, Chapter } from '@apiteam/types/src'
import Fuse from 'fuse.js'

import { DOCS_CONTENT } from './content'

export type DocsSearchIndex = Fuse<Chapter | DocsPage> & {
  variant: 'docs'
}

const flattenedContent: (Chapter | DocsPage)[] = []

const traverseContent = (
  content: (Chapter | DocsPage)[],
  previusSlugs: string[] = []
) => {
  for (const item of content) {
    if (item.variant === 'page') {
      flattenedContent.push({
        ...item,
        slug: `/${[...previusSlugs, item.slug].join('/')}`,
      })
    } else {
      traverseContent(item.content, [...previusSlugs, item.slug])
    }
  }
}

traverseContent(DOCS_CONTENT)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DOCS_SEARCH_INDEX: DocsSearchIndex = new Fuse(flattenedContent, {
  keys: ['title', 'markdown'],
  includeScore: true,
  threshold: 0.3,
  minMatchCharLength: 3,
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
DOCS_SEARCH_INDEX.variant = 'docs'

export { DOCS_SEARCH_INDEX }
