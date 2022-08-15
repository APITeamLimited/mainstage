import { useEffect, useState } from 'react'

import {
  Box,
  Tabs,
  Tab,
  Typography,
  Grid,
  Stack,
  Container,
  useTheme,
} from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { Redirect, routes, useParams } from '@redwoodjs/router'
import { MetaTags } from '@redwoodjs/web'

import { CustomTabs } from 'src/components/app/CustomTabs'
import { QuickActions } from 'src/components/app/dashboard/QuickActions'

import { ProjectsSection } from './sections/ProjectsSection'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      style={{
        padding: '0px',
        height: '100%',
        width: '100%',
        maxHeight: '100%',
        overflow: 'hidden',
      }}
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            maxHeight: '100%',
          }}
        >
          {children}
        </Box>
      )}
    </div>
  )
}

const DashboardPage = () => {
  const params = useParams()
  const theme = useTheme()
  const initialSection = params.initialSection || 'overview'

  const getInitalTabValue = () => {
    if (initialSection === 'projects') {
      return 1
    } else if (initialSection === 'admin') {
      return 2
    } else {
      // Todo: Temporary, should be 0, just for dev convenience
      return 1
    }
  }

  const [tabValue, setTabValue] = useState(getInitalTabValue())

  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for designing, testing and scaling your APIs collaboratively"
      />
      <Container
        sx={{
          height: '100%',
          width: '100%',
          maxHeight: '100%',
          overflowY: 'hidden',
          overflowX: 'hidden',
        }}
        maxWidth={false}
        disableGutters
      >
        <Stack
          sx={{
            padding: 4,
          }}
          spacing={4}
        >
          <Box>
            <CustomTabs
              value={tabValue}
              onChange={setTabValue}
              names={['Overview', 'Projects', 'Admin']}
            />
          </Box>
          <Box
            sx={{
              paddingX: 1,
            }}
          >
            <TabPanel value={tabValue} index={0}>
              Item One
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <ProjectsSection />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              Item Three
            </TabPanel>
          </Box>
        </Stack>
      </Container>
    </>
  )
}

export default DashboardPage
