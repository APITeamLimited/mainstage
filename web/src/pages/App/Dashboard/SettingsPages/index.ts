import { SideTab } from 'src/components/app/dashboard/utils/SideTabManager'

export const SETTINGS_TABS = [
  {
    label: '',
    displayName: 'General',
    requiredRole: 'MEMBER',
    teamOnly: false,
  },
  {
    label: 'billing',
    displayName: 'Billing',
    requiredRole: 'ADMIN',
    teamOnly: false,
  },
  {
    label: 'members',
    displayName: 'Members',
    requiredRole: 'ADMIN',
    teamOnly: true,
  },
  {
    label: 'danger-zone',
    displayName: 'Danger Zone',
    isDangerous: true,
  },
] as SideTab[]
