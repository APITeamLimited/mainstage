import { useRef, useState } from 'react'

import {
  Avatar,
  AvatarGroup,
  Tooltip,
  useTheme,
  Badge,
  Button,
} from '@mui/material'

import {
  useServerAwareness,
  useWorkspaceInfo,
} from 'src/entity-engine/EntityEngine'

import { TeamMembersDropdown } from './TeamMembersDropdown'

export const OnlineMembers = () => {
  const theme = useTheme()
  const serverAwareness = useServerAwareness()
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false)
  const anchorEl = useRef<HTMLButtonElement>(null)
  const workspaceInfo = useWorkspaceInfo()

  if (workspaceInfo?.scope?.variant !== 'TEAM') return <></>
  if (!serverAwareness || serverAwareness.variant === 'USER') return <></>

  return (
    <>
      <Tooltip title="Team Members">
        <Button
          variant="text"
          sx={{
            padding: 0.5,
          }}
          onClick={() => setDropdownOpen(true)}
          ref={anchorEl}
        >
          <AvatarGroup max={4}>
            {serverAwareness.members.map((member, index) => {
              const isOnline =
                member.lastOnline &&
                new Date(member.lastOnline).getTime() >
                  new Date().getTime() - 1000 * 60

              return isOnline ? (
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#44b700',
                      color: '#44b700',
                      height: '12px',
                      width: '12px',
                      borderRadius: '50%',
                      right: '6px',
                      bottom: '6px',
                      border: `2px solid ${theme.palette.background.paper}`,
                    },
                  }}
                  key={index}
                >
                  <Avatar
                    alt={member.displayName}
                    src={member.profilePicture || ''}
                    sx={{
                      width: 30,
                      height: 30,
                    }}
                  />
                </Badge>
              ) : (
                <Avatar
                  alt={member.displayName}
                  src={member.profilePicture || ''}
                  sx={{
                    width: 30,
                    height: 30,
                  }}
                  key={index}
                />
              )
            })}
          </AvatarGroup>
        </Button>
      </Tooltip>
      <TeamMembersDropdown
        anchorEl={anchorEl.current}
        members={serverAwareness.members}
        onClose={() => setDropdownOpen(false)}
        open={dropdownOpen}
      />
    </>
  )
}
