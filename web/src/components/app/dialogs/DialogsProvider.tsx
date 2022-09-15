import { ReactNode } from 'react'

import { CreateCollectionDialog } from './CreateCollectionDialog'
import { CreateEnvironmentDialog } from './CreateEnvironmentDialog'
import { CreateProjectDialog } from './CreateProjectDialog'
import { ImportDialog } from './ImportDialog'
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
    <ImportDialog />
    {children}
  </>
)
