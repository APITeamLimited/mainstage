import { useMemo } from 'react'

import type { Chapter, DocsPage } from '@apiteam/types/docs/docs-lib'
import { Breadcrumbs, Link, SvgIcon, useTheme } from '@mui/material'

import { navigate, useLocation } from '@redwoodjs/router'

import { useDocsContent } from 'src/contexts/imports/docs-content-provider'
import { getDocsIcon } from 'src/layouts/Docs/routing'

import { navigateParts } from '../part-utils'

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
        const to = `/${parts
          .slice(0, index + 1)
          .map((p) => p.slug)
          .join('/')}`

        const icon = getDocsIcon(content.variant, index === 0)

        return (
          <Link
            underline="hover"
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            color={theme.palette.primary.main}
            onClick={() => navigate(to)}
            key={index}
          >
            {index === 0 && <SvgIcon sx={{ mr: 0.5 }} component={icon} />}
            {index > 0 && part.title}
          </Link>
        )
      })}
    </Breadcrumbs>
  )
}
