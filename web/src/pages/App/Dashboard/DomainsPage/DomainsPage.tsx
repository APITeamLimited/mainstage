import { useMemo, useState } from 'react'

import {
  Button,
  Card,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import { VerifiedDomains, VerifiedDomainsVariables } from 'types/graphql'

import { MetaTags, useQuery } from '@redwoodjs/web'

import { DashboardPageFrame } from 'src/components/app/dashboard/utils/DashboardPageFrame'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { AddDomainDialog } from './AddDomainDialog'
import { DomainsList } from './DomainsList'
import { NoDomainsCard } from './NoDomainsCard'

import { VERIFIED_DOMAINS_CARD_HEIGHT } from '.'

export const VERIFIED_DOMAINS_QUERY = gql`
  query VerifiedDomains($teamId: String) {
    verifiedDomains(teamId: $teamId) {
      id
      createdAt
      domain
      variant
      variantTargetId
      txtRecord
      verified
    }
  }
`

export const DomainsPage = () => {
  const [addDomainDialogOpen, setAddDomainDialogOpen] = useState(false)
  const theme = useTheme()
  const workspace = useWorkspaceInfo()

  const {
    data: verifiedDomainsData,
    error: verifiedDomainsError,
    refetch: refetchDomainsCallback,
  } = useQuery<VerifiedDomains, VerifiedDomainsVariables>(
    VERIFIED_DOMAINS_QUERY,
    {
      variables: {
        teamId:
          workspace?.scope.variant === 'TEAM'
            ? workspace?.scope.variantTargetId
            : null,
      },
      pollInterval: 5000,
    }
  )

  const enableMutations = useMemo(
    () =>
      workspace?.scope.variant === 'TEAM'
        ? workspace?.scope?.role === 'ADMIN' ||
          workspace?.scope?.role === 'OWNER'
        : true,
    [workspace]
  )

  const [collapsedList, setCollapsedList] = useState<string[]>([])

  return (
    <>
      <MetaTags title="Domains" />
      <DashboardPageFrame
        title="Domains"
        actionArea={
          <Stack direction="row" spacing={2}>
            {enableMutations ? (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setAddDomainDialogOpen(true)}
              >
                Add Domain
              </Button>
            ) : (
              <Tooltip title="Ask your team admin or owner to add a domain">
                <span>
                  <Button variant="contained" color="primary" disabled>
                    Add Domain
                  </Button>
                </span>
              </Tooltip>
            )}
          </Stack>
        }
      >
        {verifiedDomainsError ? (
          <Card>
            <Stack
              spacing={4}
              sx={{ p: 2, minHeight: VERIFIED_DOMAINS_CARD_HEIGHT }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h6" color={theme.palette.error.main}>
                An error occured fetching your domains
              </Typography>
            </Stack>
          </Card>
        ) : !verifiedDomainsData ? (
          <Skeleton width="100%" height={VERIFIED_DOMAINS_CARD_HEIGHT} />
        ) : verifiedDomainsData.verifiedDomains.length > 0 ? (
          <DomainsList
            verifiedDomains={verifiedDomainsData.verifiedDomains}
            collapsedList={collapsedList}
            setCollapsedList={setCollapsedList}
            setAddDomainDialogOpen={setAddDomainDialogOpen}
            refetchDomainsCallback={refetchDomainsCallback}
            enableMutations={enableMutations}
          />
        ) : (
          <NoDomainsCard
            openAddDomainDialog={() => setAddDomainDialogOpen(true)}
            enableMutations={enableMutations}
          />
        )}
        {enableMutations && (
          <AddDomainDialog
            open={addDomainDialogOpen}
            onClose={() => setAddDomainDialogOpen(false)}
          />
        )}
      </DashboardPageFrame>
    </>
  )
}

export default DomainsPage
