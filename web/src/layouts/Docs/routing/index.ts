import DescriptionIcon from '@mui/icons-material/Description'
import HomeIcon from '@mui/icons-material/Home'
import ViewListIcon from '@mui/icons-material/ViewList'

import type { DocsContent } from 'src/contexts/imports/docs-content-provider'

export * from './generate-doc-routes'
export * from './DocsPage'

export const getDocsIcon = (
  variant: DocsContent[0]['variant'],
  isRoot = false
) => {
  if (isRoot) {
    return HomeIcon
  }

  if (variant === 'chapter') {
    return ViewListIcon
  }

  return DescriptionIcon
}
