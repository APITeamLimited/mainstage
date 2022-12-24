import type { ElementType } from 'react'

import CloudSyncIcon from '@mui/icons-material/CloudSync'
import ComputerIcon from '@mui/icons-material/Computer'
import DoneAllIcon from '@mui/icons-material/DoneAll'

import { OverviewPanel } from 'src/layouts/Landing/components/templates/OverviewPanel'

type OverviewItem = {
  icon: ElementType
  title: string
  description: string
}

const overviewMessages: OverviewItem[] = [
  {
    icon: ComputerIcon,
    title: 'Debug Locally',
    description:
      'Debug your API requests locally with the APITeam Agent. Send requests and run load tests from your local machine.',
  },
  {
    icon: CloudSyncIcon,
    title: 'Cloud Sync',
    description:
      'Local requests and load tests are sent to the cloud for real-time insights on your APIs performance and can be viewed by other team members.',
  },
  {
    icon: DoneAllIcon,
    title: 'No Usage Limits',
    description:
      'Theres no usage limit on the number of requests or load tests you can run as they are from your local machine.',
  },
]

export const WhyUseAgent = () => (
  <OverviewPanel
    title="APITeam Agent"
    description="APITeam Agent extends the APITeam platform to allow you to debug your API requests locally."
    items={overviewMessages}
  />
)
