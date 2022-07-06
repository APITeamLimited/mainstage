import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import {
  Avatar,
  Box,
  Divider,
  ListItemText,
  MenuItem,
  Popover,
  Typography,
  SvgIcon,
  Button,
  useTheme,
  Stack,
} from '@mui/material'
import toast from 'react-hot-toast'

import { useAuth } from '@redwoodjs/auth'
import { Link, navigate, routes } from '@redwoodjs/router'

import { CurrentUser } from './DropdownButton'

interface AccountPopoverProps {
  anchorEl: null | Element
  onClose?: () => void
  open?: boolean
  currentUser: CurrentUser | null
}

export const DropdownPopover = (props: AccountPopoverProps) => {
  const { anchorEl, onClose, open, ...other } = props
  const theme = useTheme()
  const { logOut } = useAuth()

  const { currentUser } = props

  const fullName = currentUser
    ? `${props.currentUser?.firstName} ${props.currentUser?.lastName}`
    : 'Anonymous'

  const handleLogout = () => {
    logOut()
    navigate(routes.root())
  }

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{
        horizontal: 'center',
        vertical: 'bottom',
      }}
      keepMounted
      onClose={onClose}
      open={!!open}
      PaperProps={{ sx: { width: 300 } }}
      transitionDuration={0}
      {...other}
      sx={{
        mt: 1,
      }}
    >
      <Box
        sx={{
          alignItems: 'center',
          p: 2,
          paddingLeft: 3,
          display: 'flex',
        }}
      >
        <Avatar
          src={currentUser?.profilePicture}
          sx={{
            height: 60,
            width: 60,
          }}
        >
          <SvgIcon
            component={AccountCircleIcon}
            sx={{
              height: 60,
              width: 60,
            }}
          />
        </Avatar>
        <Box
          sx={{
            ml: 2,
          }}
        >
          <Typography variant="h6">{fullName}</Typography>
          <Typography color="textSecondary" variant="body2">
            {currentUser?.email || null}
          </Typography>
        </Box>
      </Box>
      <Divider />
      <Box sx={{ my: 1 }}>
        <Link
          to="/dashboard/social/profile"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <MenuItem>
            <ListItemText
              primary={
                <Typography variant="body1" marginLeft={1} paddingY={0.25}>
                  Profile
                </Typography>
              }
            />
          </MenuItem>
        </Link>
        <Link
          to="/dashboard/account"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <MenuItem>
            <ListItemText
              primary={
                <Typography variant="body1" marginLeft={1} paddingY={0.25}>
                  Settings
                </Typography>
              }
            />
          </MenuItem>
        </Link>
        <Link
          to="/dashboard"
          style={{
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <MenuItem>
            <ListItemText
              primary={
                <Typography variant="body1" marginLeft={1} paddingY={0.25}>
                  Change organization
                </Typography>
              }
            />
          </MenuItem>
        </Link>
      </Box>
      <Divider />
      <Box sx={{ my: 1 }}>
        {currentUser ? (
          <>
            <MenuItem>
              <Button>Invite</Button>
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemText
                primary={
                  <Typography variant="body1" marginLeft={1} paddingY={0.25}>
                    Logout
                  </Typography>
                }
              />
            </MenuItem>
          </>
        ) : (
          <Stack
            spacing={2}
            sx={{
              mx: 3,
              mb: 3,
              mt: 2,
            }}
          >
            <Typography
              sx={{
                color: theme.palette.text.secondary,
                fontSize: 'small',
              }}
            >
              Login to APITeam to access free cloud backup and team
              collaboration
            </Typography>
            <Box>
              <Link
                to={routes.login()}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Button variant="contained" color="primary">
                  Login
                </Button>
              </Link>
            </Box>
          </Stack>
        )}
      </Box>
    </Popover>
  )
}
