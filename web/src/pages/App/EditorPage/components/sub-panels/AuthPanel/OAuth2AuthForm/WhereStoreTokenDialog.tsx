import { OAuth2Token, Auth, WrappedOAuth2Token } from '@apiteam/types/src'
import {
  Button,
  Dialog,
  DialogTitle,
  Stack,
  Typography,
  useTheme,
} from '@mui/material'

type WhereStoreTokenDialogProps = {
  foundToken: OAuth2Token | null
  auth: Auth & {
    authType: 'oauth2'
  }
  oauthLocalSaveKey: string
  setAuth: (auth: Auth) => void
  onClose: () => void
}

export const WhereStoreTokenDialog = ({
  foundToken,
  auth,
  oauthLocalSaveKey,
  setAuth,
  onClose,
}: WhereStoreTokenDialogProps) => {
  const theme = useTheme()

  const handleStoreResult = (where: 'local' | 'workspace') => {
    if (foundToken === null) {
      throw new Error('Found token is null')
    }

    const newWrappedToken: WrappedOAuth2Token = {
      syncType: where,
      createdAt: new Date().toISOString(),
      token: foundToken,
    }

    setAuth({
      ...auth,
      existingAccessTokens: [...auth.existingAccessTokens, newWrappedToken],
    })

    const alreadyActiveToken = localStorage.getItem(
      `apiteam:oauth2:${oauthLocalSaveKey}:active`
    )

    if (!alreadyActiveToken) {
      localStorage.setItem(
        `apiteam:oauth2:${oauthLocalSaveKey}:active`,
        JSON.stringify(newWrappedToken)
      )
    }

    onClose()
  }

  return (
    <Dialog open={foundToken !== null} maxWidth="sm" fullWidth>
      <DialogTitle>Authentication Complete</DialogTitle>
      <Stack
        sx={{
          padding: 4,
          paddingTop: 2,
        }}
        spacing={4}
      >
        <Typography
          variant="body1"
          sx={{
            userSelect: 'none',
          }}
        >
          Successfully obtained OAuth2 Access Token, where would you like to
          store it?
        </Typography>
        <Stack direction="row" spacing={4}>
          <Stack
            spacing={2}
            justifyContent="space-between"
            sx={{
              width: `calc(50% - ${theme.spacing(2)})`,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              Store Locally
            </Typography>
            <Typography
              variant="body2"
              sx={{
                userSelect: 'none',
                color: theme.palette.text.secondary,
              }}
            >
              This will store the token in your browser&apos;s local storage.
              This is the most secure option, but it will not be available to
              other devices.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleStoreResult('local')}
            >
              Store Locally
            </Button>
          </Stack>
          <Stack
            spacing={2}
            justifyContent="space-between"
            sx={{
              width: `calc(50% - ${theme.spacing(2)})`,
            }}
          >
            <Typography
              variant="body1"
              sx={{
                fontWeight: 'bold',
                userSelect: 'none',
              }}
            >
              Sync To Workspace
            </Typography>
            <Typography
              variant="body2"
              sx={{
                userSelect: 'none',
                color: theme.palette.text.secondary,
              }}
            >
              This will store the token in your workspace. This will be
              available to other users
            </Typography>
            <Button
              variant="contained"
              color="info"
              onClick={() => handleStoreResult('workspace')}
            >
              Sync To Workspace
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </Dialog>
  )
}
