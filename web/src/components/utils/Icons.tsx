import FeaturedPlayListIcon from '@mui/icons-material/FeaturedPlayList'
import ImportExportIcon from '@mui/icons-material/ImportExport'
import PublicIcon from '@mui/icons-material/Public'
import WifiTetheringIcon from '@mui/icons-material/WifiTethering'
import WifiTetheringOffIcon from '@mui/icons-material/WifiTetheringOff'
import type { SvgIconProps } from '@mui/material'

export const GlobeTestIcon = (props: SvgIconProps) => <PublicIcon {...props} />

export const CollectionEditorIcon = (props: SvgIconProps) => (
  <FeaturedPlayListIcon {...props} />
)

export const ImporterIcon = (props: SvgIconProps) => (
  <ImportExportIcon {...props} />
)

export const LocalAgentIcon = (
  props: SvgIconProps & {
    connected?: boolean
  }
) => {
  const { connected = true, ...rest } = props

  return connected ? (
    <WifiTetheringIcon {...rest} />
  ) : (
    <WifiTetheringOffIcon {...rest} />
  )
}
