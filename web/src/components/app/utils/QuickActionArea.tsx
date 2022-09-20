import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Stack, Switch, IconButton, Tooltip, Box } from '@mui/material'

type QuickActionAreaProps = {
  onDeleteCallback?: () => void
  isBulkEditing?: boolean
  setIsBulkEditing?: (newIsBulkEditing: boolean) => void
  prettyPrintCallback?: () => void
  customActions?: React.ReactNode[]
}

export const QuickActionArea = ({
  onDeleteCallback,
  isBulkEditing,
  setIsBulkEditing,
  prettyPrintCallback,
  customActions = [],
}: QuickActionAreaProps) => {
  const actions = [...customActions]

  if (prettyPrintCallback !== undefined) {
    actions.push(
      <Tooltip title="Pretty Print">
        <Box>
          <IconButton onClick={prettyPrintCallback}>
            <AutoFixHighIcon />
          </IconButton>
        </Box>
      </Tooltip>
    )
  }

  if (onDeleteCallback !== undefined) {
    actions.push(
      <Tooltip title="Delete All">
        <Box>
          <IconButton onClick={onDeleteCallback}>
            <DeleteSweepIcon />
          </IconButton>
        </Box>
      </Tooltip>
    )
  }

  if (isBulkEditing !== undefined && setIsBulkEditing !== undefined) {
    actions.push(
      <Tooltip title="Bulk Edit">
        <Box>
          <Switch
            checked={isBulkEditing}
            onChange={(_, value) => setIsBulkEditing(value)}
          />
        </Box>
      </Tooltip>
    )
  }

  return (
    <Stack
      alignItems="center"
      direction="row"
      spacing={1}
      justifyContent="flex-end"
    >
      {actions.map((action, index) => (
        <Box key={index}>{action}</Box>
      ))}
    </Stack>
  )
}
