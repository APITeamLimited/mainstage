import { Button, Stack } from '@mui/material'

type SortableNewItemButtonProps = {
  onNewKeyValuePair: () => void
}

export const SortableNewItemButton = ({
  onNewKeyValuePair,
}: SortableNewItemButtonProps) => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Button
        variant="outlined"
        onClick={onNewKeyValuePair}
        sx={{
          marginTop: 2,
        }}
      >
        New Key/Value Pair
      </Button>
    </Stack>
  )
}
