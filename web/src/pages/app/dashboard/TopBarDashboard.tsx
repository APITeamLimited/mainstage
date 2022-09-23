import { useCallback, useEffect, useMemo, useState } from 'react'

import { Box, Stack, Button, useTheme } from '@mui/material'
import { Container } from '@mui/system'

import { navigate, routes, useLocation } from '@redwoodjs/router'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

type PageEndpoint = {
  name: string
  endpoint: string
  activeSecondaryEndpoints?: string[]
}

export const TopBarDashboard = () => {
  const { pathname } = useLocation()
  const workspaceInfo = useWorkspaceInfo()
  const theme = useTheme()

  const pages = useMemo<PageEndpoint[]>(() => {
    const isLeastAdmin =
      workspaceInfo?.scope?.role === 'ADMIN' ||
      workspaceInfo?.scope?.role === 'OWNER' ||
      false

    const isOwner = workspaceInfo?.scope?.role === 'OWNER' || false

    const currentPages = [
      {
        name: 'Overview',
        endpoint: routes.dashboard(),
      },
      {
        name: 'Domains',
        endpoint: routes.domains(),
      },
      {
        name: 'Settings',
        endpoint: routes.settingsWorkspace(),
        activeSecondaryEndpoints: [
          routes.settingsWorkspaceMembers(),
          routes.settingsWorkspaceDangerZone(),
        ],
      },
    ]

    return currentPages
  }, [workspaceInfo?.scope?.role])

  const getCurrentPage = useCallback(() => {
    const primaryPage = pages.find((page) => page.endpoint === pathname) || null
    if (primaryPage) return primaryPage

    // Check if any of the secondary pages are active
    return (
      pages.find((page) => {
        return page.activeSecondaryEndpoints?.find(
          (endpoint) => endpoint === pathname
        )
      }) || null
    )
  }, [pages, pathname])

  const [currentEndpoint, setCurrentEndpoint] = useState<PageEndpoint | null>(
    getCurrentPage()
  )

  useEffect(
    () => setCurrentEndpoint(getCurrentPage()),
    [getCurrentPage, pathname]
  )

  if (!currentEndpoint) {
    return <></>
  }

  const handleChange = (newValue: number) => {
    pages.forEach((page, index) => {
      if (newValue === index) {
        navigate(page.endpoint)
        return
      }
    })
  }

  return (
    <Container>
      <Stack
        direction="row"
        spacing={2}
        sx={{
          paddingY: 0.5,
        }}
      >
        {pages.map((page, index) => (
          <Box key={index}>
            <Button
              variant="text"
              color="info"
              onClick={() => handleChange(index)}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                color:
                  currentEndpoint.name === page.name
                    ? theme.palette.primary.main
                    : theme.palette.text.secondary,
              }}
            >
              {page.name}
            </Button>
          </Box>
        ))}
      </Stack>
    </Container>
  )
}
