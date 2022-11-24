import { useMemo } from 'react'

import { DocsPage, Chapter, searchInMarkdown } from '@apiteam/types/src'
import { Card, Divider, Typography, useTheme } from '@mui/material'
import { Stack } from '@mui/system'

import { navigate, useLocation } from '@redwoodjs/router'

import { markdownLineSpacing } from 'src/components/utils/Markdown'
import { useDocsContent } from 'src/contexts/imports/docs-content-provider'

type ContentsItem = {
  variant: 'page' | 'chapter'
  title: string
  slug: string
  depth: number
  active?: boolean
}

const generateChapterContent = (
  pathname: string,
  allContent: (DocsPage | Chapter)[]
) => {
  const allPathnameParts = pathname.slice(1).split('/')
  const chapter = searchInMarkdown(allPathnameParts, allContent)

  if (chapter === null || chapter.variant !== 'chapter') {
    throw new Error('Chapter not found')
  }

  return navigateContent(pathname, chapter.content)
}

const navigateContent = (
  pathname: string,
  content: (DocsPage | Chapter)[],
  depth = 0,
  existingSlugs = ['docs']
): ContentsItem[] => {
  const results: ContentsItem[] = []

  for (const c of content) {
    if (c.variant === 'page') {
      results.push({
        variant: 'page',
        title: c.title,
        slug: `/${existingSlugs.join('/')}/${c.slug}`,
        active: pathname.endsWith(c.slug),
        depth,
      })
    } else {
      results.push({
        variant: 'chapter',
        title: c.title,
        slug: `/${existingSlugs.join('/')}/${c.slug}`,
        depth,
        active: pathname.endsWith(c.slug),
      })
      results.push(
        ...navigateContent(pathname, c.content, depth + 1, [
          ...existingSlugs,
          c.slug,
        ])
      )
    }
  }

  return results
}

export const DocContents = () => {
  const allContent = useDocsContent()
  const theme = useTheme()
  const { pathname } = useLocation()

  const childItems = useMemo(
    () => generateChapterContent(pathname, allContent),
    [pathname, allContent]
  )

  return (
    <Card sx={{ p: 2, mb: markdownLineSpacing }} variant="outlined">
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight="bold">
          Contents
        </Typography>
        <Divider />
        <Stack spacing={1}>
          {childItems.map((item) => (
            <Typography
              key={item.slug}
              sx={{
                paddingLeft: item.depth * 2,
                fontWeight: 'bold',
                color: theme.palette.primary.main,
                cursor: 'pointer',
                // Bullet point
                '&::before': {
                  content: '"•"',
                  color: theme.palette.text.secondary,
                  marginLeft: 1,
                  marginRight: 2,
                },
                textTransform: 'none',
              }}
              variant="body2"
              onClick={() => navigate(item.slug)}
            >
              {item.title} {item.active && '👈'}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Card>
  )
}
