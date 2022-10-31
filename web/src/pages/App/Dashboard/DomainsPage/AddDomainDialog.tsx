import { useState } from 'react'

import { useApolloClient } from '@apollo/client'
import {
  Stack,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormHelperText,
  Snackbar,
  Alert,
  Dialog,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Typography,
  useTheme,
} from '@mui/material'
import { useFormik } from 'formik'
import {
  AddVerifiedDomain,
  AddVerifiedDomainVariables,
  PerformVerification,
  PerformVerificationVariables,
} from 'types/graphql'
import * as Yup from 'yup'

import { useMutation } from '@redwoodjs/web'

import { CopyBox } from 'src/components/app/utils/CopyBox'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { VERIFIED_DOMAINS_QUERY } from './DomainsPage'

const ADD_VERIFIED_DOMAIN_MUTATION = gql`
  mutation AddVerifiedDomain($domain: String!, $teamId: String) {
    addVerifiedDomain(domain: $domain, teamId: $teamId) {
      id
      domain
      verified
      txtRecord
    }
  }
`

export const PERFORM_VERIFICATION_MUTATION = gql`
  mutation PerformVerification($verifiedDomainId: String!, $teamId: String) {
    performVerification(verifiedDomainId: $verifiedDomainId, teamId: $teamId) {
      id
      domain
      verified
    }
  }
`

type AddDomainDialogProps = {
  open: boolean
  onClose: () => void
}

export const AddDomainDialog = ({ open, onClose }: AddDomainDialogProps) => {
  const theme = useTheme()

  const workspace = useWorkspaceInfo()
  const [txtRecord, setTxtRecord] = useState('')
  const [activeStep, setActiveStep] = useState(0)

  const [domain, setDomain] = useState<string | null>(null)
  const [verifiedDomainId, setVerifiedDomainId] = useState<string | null>(null)

  const apolloClient = useApolloClient()

  const formik = useFormik({
    initialValues: {
      domain: '',
      submit: null,
    },
    validationSchema: Yup.object({
      domain: Yup.string().required('Domain is required'),
    }),
    onSubmit: (values) => {
      addDomain({
        variables: {
          domain: values.domain,
          teamId:
            workspace?.scope?.variant === 'TEAM'
              ? workspace.scope.variantTargetId
              : null,
        },
      })
    },
  })

  const refetchVerifiedDomains = () =>
    apolloClient.query({
      query: VERIFIED_DOMAINS_QUERY,
      variables: {
        teamId:
          workspace?.scope.variant === 'TEAM'
            ? workspace?.scope.variantTargetId
            : null,
      },
    })

  const [addDomain, { reset: resetAddDomain }] = useMutation<
    AddVerifiedDomain,
    AddVerifiedDomainVariables
  >(ADD_VERIFIED_DOMAIN_MUTATION, {
    onCompleted: (data) => {
      setTxtRecord(data.addVerifiedDomain.txtRecord)
      setVerifiedDomainId(data.addVerifiedDomain.id)
      setDomain(data.addVerifiedDomain.domain)
      setActiveStep(1)
      refetchVerifiedDomains()
    },
    onError: (error) => {
      formik.setErrors({
        submit: error.message,
      })
      formik.setSubmitting(false)
    },
  })

  const [
    performVerification,
    { reset: resetPerformVerification, loading: isVerifyingDomain },
  ] = useMutation<PerformVerification, PerformVerificationVariables>(
    PERFORM_VERIFICATION_MUTATION,
    {
      onCompleted: () => {
        setSnackSuccessMessage('Domain verified successfully')
        setActiveStep(2)
        refetchVerifiedDomains()
      },
      onError: (error) => {
        setSnackErrorMessage(error.message)
      },
    }
  )

  const handleClose = () => {
    onClose()
    formik.resetForm()
    resetAddDomain()
    resetPerformVerification()
    setTxtRecord('')
    setVerifiedDomainId(null)
    setActiveStep(0)
  }

  const [snackSuccessMessage, setSnackSuccessMessage] = useState<string | null>(
    null
  )
  const [snackErrorMessage, setSnackErrorMessage] = useState<string | null>(
    null
  )

  return (
    <>
      <Snackbar
        open={!!snackSuccessMessage}
        onClose={() => setSnackSuccessMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {snackSuccessMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!snackErrorMessage}
        onClose={() => setSnackErrorMessage(null)}
        autoHideDuration={5000}
      >
        <Alert severity="error" sx={{ width: '100%' }}>
          {snackErrorMessage}
        </Alert>
      </Snackbar>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form noValidate onSubmit={formik.handleSubmit}>
          <DialogTitle>Add Domain</DialogTitle>
          <DialogContent>
            <Stepper activeStep={activeStep} orientation="vertical">
              <Step>
                <StepLabel>Add Domain</StepLabel>
                <StepContent>
                  <Stack spacing={2}>
                    <FormHelperText>
                      To verify a domain you must add a TXT record to your DNS
                      provider.
                    </FormHelperText>
                    <TextField
                      label="Domain"
                      name="domain"
                      value={formik.values.domain}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      size="small"
                      error={Boolean(
                        formik.touched.domain && formik.errors.domain
                      )}
                      helperText={formik.touched.domain && formik.errors.domain}
                    />
                    {formik.errors.submit && (
                      <FormHelperText error>
                        {formik.errors.submit}
                      </FormHelperText>
                    )}
                  </Stack>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Verify Domain</StepLabel>
                <StepContent>
                  <Stack spacing={2}>
                    <FormHelperText>
                      To add the domain <strong>{formik.values.domain}</strong>{' '}
                      to your workspace, add the following TXT record to your
                      DNS at the root (@ or {domain}).
                    </FormHelperText>
                    <CopyBox
                      text={txtRecord}
                      onCopy={() =>
                        setSnackSuccessMessage('Copied record to clipboard')
                      }
                    />
                    <FormHelperText>
                      It may take a while for your records to update, so feel
                      free to come back later and try again.
                    </FormHelperText>
                  </Stack>
                </StepContent>
              </Step>
              <Step>
                <StepLabel>Domain Verified</StepLabel>
                <StepContent>
                  <Typography color={theme.palette.success.main}>
                    Domain verified successfully, you&apos;ll now be able to use
                    it to run tests with greater load limits.
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </DialogContent>
          <DialogActions>
            {activeStep <= 1 && (
              <Button onClick={handleClose}>
                {activeStep === 0 ? 'Cancel' : "I'll do this later"}
              </Button>
            )}
            {activeStep === 0 && (
              <Button
                variant="contained"
                type="submit"
                disabled={formik.isSubmitting || activeStep !== 0}
              >
                Generate TXT Record
              </Button>
            )}
            {activeStep === 1 && (
              <Button
                variant="contained"
                onClick={() =>
                  performVerification({
                    variables: {
                      verifiedDomainId: verifiedDomainId as string,
                      teamId:
                        workspace?.scope?.variant === 'TEAM'
                          ? workspace.scope.variantTargetId
                          : null,
                    },
                  })
                }
                disabled={isVerifyingDomain}
              >
                Verify Domain
              </Button>
            )}
            {activeStep === 2 && (
              <Button variant="contained" onClick={handleClose}>
                Close
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </>
  )
}
