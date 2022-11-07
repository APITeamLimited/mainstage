export type Chapter = {
  variant: 'chapter'
  title: string
  slug: string
  markdown: string
  content: (Chapter | DocsPage)[]
}

export type DocsPage = {
  variant: 'page'
  title: string
  slug: string
  markdown: string
}

export const searchForContent = (
  pathname: string,
  docsContent: (Chapter | DocsPage)[]
): Chapter | DocsPage | null => {
  const pathParts = pathname.slice(1).split('/')
  return searchInMarkdown(pathParts, docsContent)
}

export const searchInMarkdown = (
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
