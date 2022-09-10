import { useCallback, useEffect, useMemo, useState } from 'react'

import { TeamRole } from '@apiteam/types'
import {
  Box,
  useTheme,
  ListItemText,
  MenuItem,
  Stack,
  Typography,
} from '@mui/material'

import { navigate, routes, useLocation } from '@redwoodjs/router'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

export type SideTab = {
  label: string
  displayName: string
  requiredRole?: TeamRole
  teamOnly?: boolean
  isDangerous?: boolean
}

type SideTabManagerProps = {
  basePath: string
  possibleTabs: SideTab[]
  children?: React.ReactNode
}

export const SideTabManager = ({
  basePath,
  possibleTabs,
  children,
}: SideTabManagerProps) => {
  const { pathname } = useLocation()
  const workspaceInfo = useWorkspaceInfo()
  const [role, setRole] = useState<TeamRole | null>()
  const theme = useTheme()

  useEffect(() => {
    if (!workspaceInfo?.scope) {
      setRole(null)
      return
    } else if (workspaceInfo.scope.variant === 'USER') {
      setRole('OWNER')
      return
    }
    setRole(workspaceInfo.scope.role as TeamRole)
  }, [workspaceInfo])

  const getActiveTab = useCallback(() => {
    // Pathname is the full path, so we need to remove the base path
    const path = pathname.replace(basePath, '').slice(1)

    return possibleTabs.find(({ label: tabPath }) => tabPath === path) || null
  }, [basePath, pathname, possibleTabs])

  const activeTab = useMemo(() => getActiveTab(), [getActiveTab])

  if (!role) return null
  if (!activeTab) return null

  return (
    <Stack direction="row" spacing={6}>
      <Stack spacing={2}>
        {possibleTabs.map(
          (
            { label, displayName, requiredRole, teamOnly, isDangerous },
            index
          ) => {
            const isActive = label === activeTab.label

            if (requiredRole === 'OWNER') {
              if (role !== 'OWNER') {
                isActive && navigate(basePath)
                return null
              }
            } else if (requiredRole === 'ADMIN') {
              if (role !== 'ADMIN' && role !== 'OWNER') {
                console.log('not admin or owner', workspaceInfo)
                isActive && navigate(basePath)
                return null
              }
            }

            if (teamOnly === true && workspaceInfo?.scope?.variant !== 'TEAM') {
              isActive && navigate(basePath)
              return null
            }

            return (
              <MenuItem
                key={index}
                onClick={() => navigate(`${basePath}/${label}`)}
              >
                <ListItemText
                  primary={
                    <Typography
                      fontWeight={isActive ? 'bold' : 'normal'}
                      color={
                        isDangerous
                          ? theme.palette.error.main
                          : theme.palette.text.primary
                      }
                    >
                      {displayName}
                    </Typography>
                  }
                />
              </MenuItem>
            )
          }
        )}
      </Stack>
      <Box
        sx={{
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Stack>
  )
}
