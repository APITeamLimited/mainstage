import { useMemo, useState } from 'react'

import {
  Card,
  Stack,
  Typography,
  Divider,
  Snackbar,
  Alert,
  Button,
} from '@mui/material'
import { VerifiedDomains } from 'types/graphql'

import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { DomainCollapsibleRow } from './DomainCollapsibleRow'

import { VERIFIED_DOMAINS_CARD_HEIGHT } from '.'

type DomainsListProps = {
  verifiedDomains: VerifiedDomains['verifiedDomains']
  collapsedList: string[]
  setCollapsedList: (list: string[]) => void
  setAddDomainDialogOpen: (open: boolean) => void
  refetchDomainsCallback: () => void
  enableMutations
}

export const DomainsList = ({
  verifiedDomains,
  collapsedList,
  setCollapsedList,
  setAddDomainDialogOpen,
  refetchDomainsCallback,
  enableMutations,
}: DomainsListProps) => {
  const workspaceInfo = useWorkspaceInfo()

  const isOwnerAdmin = useMemo(
    () =>
      workspaceInfo?.scope?.role === 'ADMIN' ||
      workspaceInfo?.scope?.role === 'OWNER',
    [workspaceInfo]
  )

  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )
  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )

  return (
    <>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => setSnackErrorMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
      {verifiedDomains.map((verifiedDomain, index) => (
        <DomainCollapsibleRow
          key={index}
          verifiedDomain={verifiedDomain}
          setSnackSuccessMessage={setSnackSuccessMessage}
          setSnackErrorMessage={setSnackErrorMessage}
          enableMutations={enableMutations}
          collapsed={!collapsedList.includes(verifiedDomain.id)}
          refetchDomainsCallback={refetchDomainsCallback}
          setCollapsed={(collapsed) => {
            if (collapsed) {
              setCollapsedList(
                collapsedList.filter((id) => id !== verifiedDomain.id)
              )
            } else {
              setCollapsedList([...collapsedList, verifiedDomain.id])
            }
          }}
        />
      ))}
    </>
  )
}
