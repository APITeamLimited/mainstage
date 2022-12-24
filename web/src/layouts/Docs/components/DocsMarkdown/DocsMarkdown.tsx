import { useEffect, useMemo, useState } from 'react'

import type { MuiMarkdownProps } from 'mui-markdown'

import { defaultMarkdownOverrides } from 'src/components/utils/Markdown'

import { DocContents } from './components/DocContents'
import { DocImage } from './components/DocImage'

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
          ...defaultMarkdownOverrides,
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
