import { ReactNode } from 'react'

import { CreateCollectionDialog } from './CreateCollectionDialog'
import { CreateEnvironmentDialog } from './CreateEnvironmentDialog'
import { CreateProjectDialog } from './CreateProjectDialog'
import { QuickstartDialog } from './QuickstartDialog'

type DialogsProviderProps = {
  children?: ReactNode
}

export const DialogsProvider = ({ children }: DialogsProviderProps) => (
  <>
    <QuickstartDialog />
    <CreateProjectDialog />
    <CreateCollectionDialog />
    <CreateEnvironmentDialog />
    {children}
  </>
)
