import {
  Card,
  Typography,
  Stack,
  Button,
  Tooltip,
  useTheme,
} from '@mui/material'

type NoDomainsCardProps = {
  openAddDomainDialog: () => void
  enableMutations: boolean
}

export const NoDomainsCard = ({
  openAddDomainDialog,
  enableMutations,
}: NoDomainsCardProps) => {
  const theme = useTheme()

  return (
    <Card>
      <Stack
        spacing={4}
        sx={{ p: 2, minHeight: '300px' }}
        alignItems="center"
        justifyContent="center"
      >
        <Typography fontWeight="bold" variant="h5">
          No Domains
        </Typography>
        <Typography variant="body1" color={theme.palette.text.secondary}>
          Verify ownership of your domains to access higher load limits
        </Typography>
        {enableMutations ? (
          <Button
            variant="contained"
            color="primary"
            onClick={openAddDomainDialog}
          >
            Add Domain
          </Button>
        ) : (
          <Tooltip title="Ask your team admin to add a domain">
            <span>
              <Button
                variant="contained"
                color="primary"
                onClick={openAddDomainDialog}
                disabled
              >
                Add Domain
              </Button>
            </span>
          </Tooltip>
        )}
      </Stack>
    </Card>
  )
}
