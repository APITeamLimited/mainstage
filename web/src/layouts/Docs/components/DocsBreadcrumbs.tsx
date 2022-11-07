import { useMemo } from 'react'

import type { Chapter, DocsPage } from '@apiteam/types/src/docs/docs-lib'
import DescriptionIcon from '@mui/icons-material/Description'
import HomeIcon from '@mui/icons-material/Home'
import ViewListIcon from '@mui/icons-material/ViewList'
import { Breadcrumbs, Link, SvgIcon, useTheme } from '@mui/material'

import { navigate, useLocation } from '@redwoodjs/router'

import { useDocsContent } from 'src/contexts/imports/docs-content-provider'

type FoundPart = {
  title: string
  slug: string
}

// Returns a list of slug parts and their associated title
const navigateParts = (
  parts: string[],
  docsContent: (Chapter | DocsPage)[]
): FoundPart[] | null => {
  const results: FoundPart[] = []
  const partToFind = parts[0]
  const content = docsContent.find((c) => c.slug === partToFind)

  if (content === undefined) {
    return null
  }

  results.push({ slug: partToFind, title: content.title })

  if (content.variant === 'page') {
    return results
  }

  if (parts.length === 1) {
    return results
  }

  const subResults = navigateParts(parts.slice(1), content.content)

  if (subResults === null) {
    return null
  }

  return results.concat(subResults)
}

type DocsBreadcrumbsProps = {
  content: Chapter | DocsPage
}

export const DocsBreadcrumbs = ({ content }: DocsBreadcrumbsProps) => {
  const theme = useTheme()

  const { pathname } = useLocation()

  const docsContent = useDocsContent()

  const parts = useMemo(() => {
    const parts = pathname.slice(1).split('/')

    const titledParts = navigateParts(parts, docsContent)

    if (titledParts === null) {
      throw new Error('Could not find content for pathname')
    }

    return titledParts
  }, [pathname, docsContent])

  return (
    <Breadcrumbs>
      {parts.map((part, index) => {
        const isLast = index === parts.length - 1
        const to = `/${parts.map((part) => part.slug).join('/')}`

        const icon =
          index === 0
            ? HomeIcon
            : !isLast
            ? ViewListIcon
            : content.variant === 'chapter'
            ? ViewListIcon
            : DescriptionIcon

        return (
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color={theme.palette.primary.main}
            onClick={() => navigate(to)}
            key={index}
          >
            <SvgIcon sx={{ mr: 0.5 }} component={icon} />
            {part.title}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}
