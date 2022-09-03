import { SideTab } from 'src/components/app/dashboard/utils/SideTabManager'

export const SETTINGS_TABS = [
  {
    label: '',
    displayName: 'General',
    requiredRole: 'MEMBER',
    teamOnly: false,
  },
  {
    label: 'members',
    displayName: 'Members',
    requiredRole: 'OWNER',
    teamOnly: true,
  },
] as SideTab[]
