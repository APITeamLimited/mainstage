import { Box, Stack, Button } from '@mui/material'
import { Container } from '@mui/system'

import { navigate, routes, useLocation } from '@redwoodjs/router'

export const TopBarDashboard = () => {
  const { pathname } = useLocation()
  const pages = ['Overview', 'Projects']
  const endpoints = ['overview', 'projects']

  // Current page is in pathname, find it
  const currentEndpoint = endpoints.find(
    (endpoint) => pathname.includes(endpoint) || pathname == '/app/dashboard'
  )

  if (!currentEndpoint) {
    return <></>
  }

  const value = endpoints.indexOf(currentEndpoint)

  const handleChange = (newValue: number) => {
    if (pages[newValue] === 'Overview') {
      navigate(routes.dashboard())
    } else {
      navigate(`/app/dashboard/${endpoints[newValue]}`)
    }
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
              color={value === index ? 'primary' : 'secondary'}
              onClick={() => handleChange(index)}
            >
              {page}
            </Button>
          </Box>
        ))}
      </Stack>
    </Container>
  )
}
