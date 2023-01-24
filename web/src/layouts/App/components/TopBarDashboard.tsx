import { useCallback, useEffect, useState } from 'react'

import { ROUTES } from '@apiteam/types/src'
import { Box, Stack, Button, useTheme } from '@mui/material'
import { Container } from '@mui/system'

import { navigate, useLocation } from '@redwoodjs/router'

type PageEndpoint = {
  name: string
  endpoint: string
  activeSecondaryEndpoints?: string[]
}

const pages = [
  {
    name: 'Overview',
    endpoint: ROUTES.dashboard,
  },
  {
    name: 'Domains',
    endpoint: ROUTES.domains,
  },
  {
    name: 'Settings',
    endpoint: ROUTES.settingsWorkspace,
    activeSecondaryEndpoints: [
      ROUTES.settingsWorkspaceMembers,
      ROUTES.settingsWorkspaceDangerZone,
      ROUTES.settingsWorkspaceBilling,
      ROUTES.settingsWorkspaceInvoices,
    ],
  },
]

export const TopBarDashboard = () => {
  const { pathname } = useLocation()
  const theme = useTheme()

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
  }, [pathname])

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
                fontWeight: 'bold',
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
