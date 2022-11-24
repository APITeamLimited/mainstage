import type { Chapter, DocsPage } from '@apiteam/types/src/docs/docs-lib'

export type FoundPart = {
  title: string
  slug: string
}

export const navigatePartsAsContent = (
  parts: string[],
  docsContent: (Chapter | DocsPage)[]
): (Chapter | DocsPage)[] | null => {
  const results: (Chapter | DocsPage)[] = []
  const partToFind = parts[0]
  const content = docsContent.find((c) => c.slug === partToFind)

  if (content === undefined) {
    return null
  }

  results.push(content)

  if (content.variant === 'page') {
    return results
  }

  if (parts.length === 1) {
    return results
  }

  const subResults = navigatePartsAsContent(parts.slice(1), content.content)

  if (subResults === null) {
    return null
  }

  return results.concat(subResults)
}

// Returns a list of slug parts and their associated title
export const navigateParts = (
  parts: string[],
  docsContent: (Chapter | DocsPage)[]
): FoundPart[] | null => {
  const content = navigatePartsAsContent(parts, docsContent)

  if (content) {
    return content.map((part) => ({
      title: part.title,
      slug: part.slug,
    }))
  }

  return null
}
