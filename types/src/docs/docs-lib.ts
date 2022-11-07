export type Chapter = {
  variant: 'chapter'
  title: string
  slug: string
  content: (Chapter | DocsPage)[]
  markdown?: string
}

export type ChapterInfo = Omit<Chapter, 'content' | 'markdown'> & {
  content: (ChapterInfo | DocsPageInfo)[]
}

export type DocsPage = {
  variant: 'page'
  title: string
  slug: string
  markdown: string
}

export type DocsPageInfo = Omit<DocsPage, 'markdown'>

export const searchForContent = (
  pathname: string,
  docsContent: (Chapter | DocsPage)[]
): Chapter | DocsPage | null => {
  const pathParts = pathname.slice(1).split('/')
  return searchInMarkdown(pathParts, docsContent)
}

const searchInMarkdown = (
  currentSlugs: string[],
  contentLayer: (Chapter | DocsPage)[]
): Chapter | DocsPage | null => {
  if (currentSlugs.length === 0) {
    return null
  }

  const currentSlug = currentSlugs[0]

  for (const content of contentLayer) {
    if (content.slug === currentSlug) {
      if (content.variant === 'page') {
        return content
      }

      // If content is chapter and final slug in currentSlugs then return chapter
      if (currentSlugs.length === 1) {
        return content
      }

      return searchInMarkdown(currentSlugs.slice(1), content.content)
    }
  }

  return null
}
