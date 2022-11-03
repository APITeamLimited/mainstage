import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import PublicIcon from '@mui/icons-material/Public'
import type { SvgIconProps } from '@mui/material'

export const GlobeTestIcon = (props: SvgIconProps) => <PublicIcon {...props} />

export const CollectionEditorIcon = (props: SvgIconProps) => (
  <FeaturedPlayListIcon {...props} />
)

export const ImporterIcon = (props: SvgIconProps) => (
  <ImportExportIcon {...props} />
)
