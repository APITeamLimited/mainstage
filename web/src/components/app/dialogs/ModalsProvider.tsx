import { ReactNode } from 'react'

import { CreateCollectionDialog } from './CreateCollectionDialog'
import { CreateProjectDialog } from './CreateProjectDialog'
import { QuickstartDialog } from './QuickstartDialog'

type ModalsProviderProps = {
  children?: ReactNode
}

export const ModalsProvider = ({ children }: ModalsProviderProps) => (
  <>
    <QuickstartDialog />
    <CreateProjectDialog />
    <CreateCollectionDialog />
    {children}
  </>
)
