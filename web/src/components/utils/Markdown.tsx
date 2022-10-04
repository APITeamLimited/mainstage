import { useEffect, useState } from 'react'

import type { MuiMarkdownProps } from 'mui-markdown'

const importMarkdownModule = async () => import('mui-markdown')
type MuiMarkdownModule = Awaited<typeof import('mui-markdown')>

export const Markdown = (props: MuiMarkdownProps) => {
  const [markdownModule, setMarkdownModule] =
    useState<MuiMarkdownModule | null>(null)

  useEffect(() => {
    importMarkdownModule().then((module) => setMarkdownModule(module))
  }, [])

  if (!markdownModule) {
    return <></>
  }

  return <markdownModule.default {...props} />
}
