import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep'
import { Stack, Switch, IconButton, Tooltip, Box } from '@mui/material'

type InputQuickActionProps = {
  onDeleteCallback?: () => void
  isBulkEditing?: boolean
  setIsBulkEditing?: (newIsBulkEditing: boolean) => void
  prettyPrintCallback?: () => void
}

export const QuickActions = ({
  onDeleteCallback,
  isBulkEditing,
  setIsBulkEditing,
  prettyPrintCallback,
}: InputQuickActionProps) => {
  const actions = []

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
            onChange={(event, value) => setIsBulkEditing(value)}
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
      {actions}
    </Stack>
  )
}
