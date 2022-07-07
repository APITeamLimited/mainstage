import { useState } from 'react'

import { Box, Tabs, Tab, Typography, Grid } from '@mui/material'

import { useAuth } from '@redwoodjs/auth'
import { MetaTags } from '@redwoodjs/web'

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
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const a11yProps = (index: number) => {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  }
}

const DashboardPage = () => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  return (
    <>
      <MetaTags
        title="APITeam | Free Unlimited Team API Development"
        description="APITeam is an all in one platform for designng, testing and scaling your APIs collaboratively"
      />
      <Box sx={{ m: 4 }}>
        <Box>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="Dashboard Tabs"
          >
            <Tab label="Overview" {...a11yProps(0)} />
            <Tab label="Projects" {...a11yProps(1)} />
            <Tab label="Admin" {...a11yProps(2)} />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          Item One
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <ProjectsSection />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
          Item Three
        </TabPanel>
        <Box
          sx={{
            marginLeft: 4,
            display: 'flex',
          }}
        >
          <QuickActions />
        </Box>
      </Box>
    </>
  )
}

export default DashboardPage
