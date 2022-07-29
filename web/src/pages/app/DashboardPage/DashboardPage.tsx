import { useEffect, useState } from 'react'

import { Box, Tabs, Tab, Typography, Grid } from '@mui/material'

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
      {...other}
    >
      {value === index && (
        <Box
          sx={{
            paddingLeft: 2,
            paddingTop: 4,
          }}
        >
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  )
}

const DashboardPage = () => {
  const params = useParams()
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
      <Box sx={{ m: 4 }}>
        <Box>
          <CustomTabs
            value={tabValue}
            onChange={setTabValue}
            names={['Overview', 'Projects', 'Admin']}
          />
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
      </Box>
    </>
  )
}

export default DashboardPage
