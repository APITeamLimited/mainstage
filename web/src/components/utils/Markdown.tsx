import { useEffect, useMemo, useState } from 'react'

import { Typography, TypographyProps } from '@mui/material'
import type { MuiMarkdownProps } from 'mui-markdown'

export const markdownLineSpacing = '12px'

const importMarkdownModule = async () => import('mui-markdown')
type MuiMarkdownModule = Awaited<typeof import('mui-markdown')>

export const Markdown = (props: MuiMarkdownProps) => {
  const [markdownModule, setMarkdownModule] =
    useState<MuiMarkdownModule | null>(null)

  useEffect(() => {
    importMarkdownModule().then((module) => setMarkdownModule(module))
  }, [])

  const customProps = useMemo(
    () =>
      ({
        ...props,
        overrides: {
          h1: {
            component: Typography,
            props: {
              variant: 'h4',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          h2: {
            component: Typography,
            props: {
              variant: 'h5',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          h3: {
            component: Typography,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          h4: {
            component: Typography,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          h5: {
            component: Typography,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          h6: {
            component: Typography,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          p: {
            component: Typography,
            props: {
              variant: 'body1',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
        },
      } as MuiMarkdownProps),
    [props]
  )

  if (!markdownModule) {
    return <></>
  }

  return <markdownModule.default {...customProps} />
}
