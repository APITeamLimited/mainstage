import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import PublicIcon from '@mui/icons-material/Public'
import type { SvgIconProps } from '@mui/material'

export const GlobeTestIcon = (props: SvgIconProps) => <PublicIcon {...props} />

export const CollectionEditorIcon = (props: SvgIconProps) => (
  <FeaturedPlayListIcon {...props} />
)
