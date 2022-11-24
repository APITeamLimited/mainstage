import { useEffect, useMemo, useState } from 'react'

import { Typography, TypographyProps } from '@mui/material'
import type { MuiMarkdownProps } from 'mui-markdown'

import { markdownLineSpacing } from 'src/components/utils/Markdown'

import { DocContents } from './components/DocContents'
import { DocImage } from './components/DocImage'
import {
  RegisteredPageHeading,
  RegisteredPageHeadingProps,
} from './components/RegisteredPageHeading'

const importMarkdownModule = async () => import('mui-markdown')
type MuiMarkdownModule = Awaited<typeof import('mui-markdown')>

export const DocsMarkdown = (props: MuiMarkdownProps) => {
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
            component: RegisteredPageHeading,
            props: {
              variant: 'h4',
              mb: markdownLineSpacing,
              actualVariant: 'h1',
            } as RegisteredPageHeadingProps,
          },
          h2: {
            component: RegisteredPageHeading,
            props: {
              variant: 'h5',
              mb: markdownLineSpacing,
              actualVariant: 'h2',
            } as RegisteredPageHeadingProps,
          },
          h3: {
            component: RegisteredPageHeading,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
              actualVariant: 'h3',
            } as RegisteredPageHeadingProps,
          },
          h4: {
            component: RegisteredPageHeading,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
              actualVariant: 'h4',
            } as RegisteredPageHeadingProps,
          },
          h5: {
            component: RegisteredPageHeading,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
              actualVariant: 'h5',
            } as RegisteredPageHeadingProps,
          },
          h6: {
            component: RegisteredPageHeading,
            props: {
              variant: 'h6',
              mb: markdownLineSpacing,
              actualVariant: 'h6',
            } as RegisteredPageHeadingProps,
          },
          p: {
            component: Typography,
            props: {
              variant: 'body1',
              mb: markdownLineSpacing,
            } as TypographyProps,
          },
          DocContents: {
            component: DocContents,
          },
          DocImage: {
            component: DocImage,
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
