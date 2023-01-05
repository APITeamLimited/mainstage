import { useEffect, useMemo, useState } from 'react'

import type { MuiMarkdownProps } from 'mui-markdown'

import { defaultMarkdownOverrides } from 'src/components/utils/Markdown'

import { DocContents } from './components/DocContents'
import { DocImage } from './components/DocImage'
import { RegisteredPageHeading } from './components/RegisteredPageHeading'

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
          ...docsMarkdownOverrides,
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

// Provide a custom heading component that will register the heading
const docsMarkdownOverrides = {
  ...defaultMarkdownOverrides,
  h1: {
    props: { ...defaultMarkdownOverrides.h1.props, actualVariant: 'h1' },
    component: RegisteredPageHeading,
  },
  h2: {
    props: { ...defaultMarkdownOverrides.h2.props, actualVariant: 'h2' },
    component: RegisteredPageHeading,
  },
  h3: {
    props: { ...defaultMarkdownOverrides.h3.props, actualVariant: 'h3' },
    component: RegisteredPageHeading,
  },
  h4: {
    props: { ...defaultMarkdownOverrides.h4.props, actualVariant: 'h4' },
    component: RegisteredPageHeading,
  },
  h5: {
    props: { ...defaultMarkdownOverrides.h5.props, actualVariant: 'h5' },
    component: RegisteredPageHeading,
  },
  h6: {
    props: { ...defaultMarkdownOverrides.h6.props, actualVariant: 'h6' },
    component: RegisteredPageHeading,
  },
}
