import { useMemo } from 'react'

import { Chapter, DocsPage } from '@apiteam/types/src'
import { Stack, Typography } from '@mui/material'

import { useLocation } from '@redwoodjs/router'

import {
  DocsContent,
  useDocsContent,
} from 'src/contexts/imports/docs-content-provider'
import { CallToClickLink } from 'src/layouts/Landing/components/CallToClickLink'

import { navigatePartsAsContent } from '../part-utils'

export const NextPageLink = () => {
  const docsContent = useDocsContent()
  const { pathname } = useLocation()

  const foundPart = useMemo(
    () => findNextPage(docsContent, pathname),
    [docsContent, pathname]
  )

  return foundPart === null ? null : (
    <Stack spacing={2}>
      <Typography variant="h6" fontWeight="bold">
        Up Next:
      </Typography>
      <span>
        <CallToClickLink
          link={foundPart.link}
          text={
            <Typography variant="h6" fontWeight="bold" color="primary">
              {foundPart.part.title}{' '}
              {foundPart.part.variant === 'chapter' ? '📚' : '📄'}
            </Typography>
          }
        />
      </span>
    </Stack>
  )
}

type LocatedPart = {
  part: Chapter | DocsPage
  link: string
}

// Searches docs content for the next page in the current chapter
// If there is no next page, return chapter above
const findNextPage = (
  docsContent: DocsContent,
  pathname: string
): LocatedPart | null => {
  const parts = navigatePartsAsContent(
    pathname.slice(1).split('/'),
    docsContent
  )

  if (parts === null || parts.length === 0) {
    return null
  }

  const searchUpwards = (parts: DocsContent): LocatedPart | null => {
    const currentPart = parts[parts.length - 1]
    const parentPart = parts[parts.length - 2]

    if (parentPart === undefined) {
      return null
    }

    if (parentPart.variant === 'chapter') {
      const currentIndex = parentPart.content.findIndex(
        (c) => c.slug === currentPart.slug
      )

      // If last item in chapter, search one level up
      if (currentIndex === parentPart.content.length - 1) {
        return searchUpwards(parts.slice(0, parts.length - 1))
      }

      return {
        part: parentPart.content[currentIndex + 1],
        link: [
          '',
          ...parts.map((p) => p.slug),
          parentPart.content[currentIndex + 1].slug,
        ].join('/'),
      }
    } else {
      throw new Error('Unexpected part type')
    }
  }

  // Check if last item in parts is a chapter
  const lastPart = parts[parts.length - 1]

  if (lastPart.variant === 'chapter' && lastPart.content.length > 0) {
    return {
      part: lastPart.content[0],
      link: ['', ...parts.map((p) => p.slug), lastPart.content[0].slug].join(
        '/'
      ),
    }
  }

  return searchUpwards(parts)
}
