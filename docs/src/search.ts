import { DocsPage, Chapter } from '@apiteam/types/src'
import Fuse from 'fuse.js'

import { DOCS_CONTENT } from './content'

export type DocsSearchIndex = Fuse<FlatContent> & {
  variant: 'docs'
}

export type FlatContent =
  | {
      title: string
      slug: string
      markdown: string
    } & (
      | {
          variant: 'page'
          chapter: string
        }
      | {
          variant: 'chapter'
        }
    )

const traverseContent = (
  content: (Chapter | DocsPage)[],
  previusSlugs: string[] = [],
  parentChapter: string | null = null
): FlatContent[] => {
  const flatContent: FlatContent[] = []

  for (const item of content) {
    if (item.variant === 'page') {
      if (!parentChapter) {
        throw new Error('Page without parent chapter')
      }

      flatContent.push({
        variant: 'page',
        title: item.title,
        slug: `/${[...previusSlugs, item.slug].join('/')}`,
        markdown: item.markdown,
        chapter: parentChapter,
      })
    } else {
      flatContent.push({
        variant: 'chapter',
        title: item.title,
        slug: `/${[...previusSlugs, item.slug].join('/')}`,
        markdown: item.markdown,
      })

      flatContent.push(
        ...traverseContent(
          item.content,
          [...previusSlugs, item.slug],
          item.title
        )
      )
    }
  }

  return flatContent
}

const flattenedContent = traverseContent(DOCS_CONTENT)

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const DOCS_SEARCH_INDEX: DocsSearchIndex = new Fuse(flattenedContent, {
  shouldSort: true,
  keys: ['title', 'markdown'],
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
DOCS_SEARCH_INDEX.variant = 'docs'

export { DOCS_SEARCH_INDEX }
