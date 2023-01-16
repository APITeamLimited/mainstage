import { useEffect, useMemo } from 'react'

import { useMutation } from '@apollo/client'
import ClearIcon from '@mui/icons-material/Clear'
import ControlPointIcon from '@mui/icons-material/ControlPoint'
import {
  Stack,
  Card,
  Divider,
  Typography,
  useTheme,
  MenuItem,
  TextField,
  Button,
  Box,
  FormHelperText,
  IconButton,
  Tooltip,
} from '@mui/material'
import { useFormik } from 'formik'
import { CreateInvitations } from 'types/graphql'
import * as Yup from 'yup'

import {
  snackErrorMessageVar,
  snackSuccessMessageVar,
} from 'src/components/app/dialogs'
import { usePlanInfo } from 'src/contexts/billing-info'
import { useWorkspaceInfo } from 'src/entity-engine/EntityEngine'

import { MemberLimitSection } from './MemberLimitSection'
import { useMembersInfo } from './MembersInfoProvider'

type InvitationInput = {
  email: string
  role: 'MEMBER' | 'ADMIN'
}[]

const ADD_NEW_MEMBERS_QUERY = gql`
  mutation CreateInvitations(
    $teamId: String!
    $invitations: [InvitationInput!]!
  ) {
    createInvitations(teamId: $teamId, invitations: $invitations) {
      id
    }
  }
`

export const AddNewMember = () => {
  const workspaceInfo = useWorkspaceInfo()
  const theme = useTheme()
  const [addMemberFunction, { data, error, reset }] =
    useMutation<CreateInvitations>(ADD_NEW_MEMBERS_QUERY)

  const planInfo = usePlanInfo()
  const { refetchInvitations, invitationsData, membersData } = useMembersInfo()

  const teamId = useMemo(() => {
    if (!workspaceInfo?.scope) return null
    if (workspaceInfo.scope?.variant === 'USER') {
      return null
    } else {
      return workspaceInfo.scope.variantTargetId
    }
  }, [workspaceInfo])

  useEffect(() => {
    if (data) {
      snackSuccessMessageVar('Invitation successfully sent')
    }
  }, [data])

  useEffect(() => {
    if (error) {
      snackErrorMessageVar('Error sending invitation')
    }
  }, [error])

  const formik = useFormik({
    initialValues: {
      pairs: [
        {
          email: '',
          role: 'MEMBER',
        },
      ] as InvitationInput,
      submit: null,
    },
    validationSchema: Yup.object({
      pairs: Yup.array().of(
        Yup.object({
          email: Yup.string()
            .email('Must be a valid email')
            .required('Email is required'),
          role: Yup.string()
            .oneOf(['MEMBER', 'ADMIN'])
            .required('Role is required'),
        })
      ),
    }),
    onSubmit: async (values): Promise<void> => {
      const { data } = await addMemberFunction({
        variables: {
          teamId,
          invitations: values.pairs,
        },
      })

      if (data) {
        refetchInvitations()
        formik.resetForm()
        formik.setFieldValue('pairs', [
          {
            email: '',
            role: 'MEMBER',
          },
        ])
        reset()
      }
    },
  })

  useEffect(() => {
    if (error) {
      formik.setErrors({
        submit: error.message,
      })
      return
    }
  }, [data, error, formik])

  const teamFull = useMemo(() => {
    if (!invitationsData || !membersData || !planInfo) return false

    if (planInfo?.maxMembers === -1) {
      return false
    }

    const currentCount =
      membersData.memberships.length + invitationsData.invitations.length

    const remainingCount = planInfo?.maxMembers - currentCount

    return remainingCount <= 0
  }, [invitationsData, membersData, planInfo])

  if (!teamId) return null

  return (
    <>
      <Card>
        <form noValidate onSubmit={formik.handleSubmit}>
          <Stack spacing={2} p={2}>
            <Typography variant="h6" fontWeight="bold">
              Add New
            </Typography>
            <MemberLimitSection />
            <Divider />
            <Typography variant="body1" color={theme.palette.text.secondary}>
              Invite new members to your team via email.
            </Typography>
            {formik.values.pairs.map((pair, index) => (
              <Stack key={index} direction="row" spacing={2}>
                <TextField
                  fullWidth
                  size="small"
                  label="Email"
                  value={pair.email}
                  onChange={(e) => {
                    const newPairs = [...formik.values.pairs]
                    newPairs[index].email = e.target.value.toLowerCase()
                    formik.setFieldValue('pairs', newPairs)
                  }}
                  error={
                    formik.errors.pairs?.[index]?.email &&
                    formik.touched.pairs?.[index]?.email
                  }
                  helperText={
                    formik.errors.pairs?.[index]?.email &&
                    formik.touched.pairs?.[index]?.email
                  }
                />
                <Box sx={{ minWidth: 200, width: 200 }}>
                  <TextField
                    fullWidth
                    select
                    label="Role"
                    value={pair.role}
                    size="small"
                    onChange={(e) => {
                      const newPairs = [...formik.values.pairs]
                      newPairs[index].role = e.target.value as
                        | 'MEMBER'
                        | 'ADMIN'
                      formik.setFieldValue('pairs', newPairs)
                    }}
                    error={!!formik.errors.pairs?.[index]?.role}
                    helperText={formik.errors.pairs?.[index]?.role}
                  >
                    <MenuItem value="MEMBER">Member</MenuItem>
                    <MenuItem value="ADMIN">Admin</MenuItem>
                  </TextField>
                </Box>
                <IconButton
                  onClick={() => {
                    const newPairs = [...formik.values.pairs]
                    newPairs.splice(index, 1)
                    formik.setFieldValue('pairs', newPairs)
                  }}
                  disabled={formik.values.pairs.length === 1}
                >
                  <ClearIcon />
                </IconButton>
              </Stack>
            ))}
            {formik.errors.submit && (
              <FormHelperText error>{formik.errors.submit}</FormHelperText>
            )}
            <Box>
              {teamFull ? (
                <Tooltip title="You have reached the maximum number of members for your plan.">
                  <Button
                    endIcon={<ControlPointIcon />}
                    variant="outlined"
                    onClick={() => {
                      formik.setFieldValue('pairs', [
                        ...formik.values.pairs,
                        {
                          email: '',
                          role: 'MEMBER',
                        },
                      ])
                    }}
                    disabled={teamFull}
                  >
                    Add Another
                  </Button>
                </Tooltip>
              ) : (
                <Button
                  endIcon={<ControlPointIcon />}
                  variant="outlined"
                  onClick={() => {
                    formik.setFieldValue('pairs', [
                      ...formik.values.pairs,
                      {
                        email: '',
                        role: 'MEMBER',
                      },
                    ])
                  }}
                  disabled={teamFull}
                >
                  Add Another
                </Button>
              )}
            </Box>
            <Divider />
            {teamFull ? (
              <Tooltip title="You have reached the maximum number of members for your plan.">
                <Box alignSelf="flex-end">
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={formik.isSubmitting || teamFull}
                  >
                    Invite
                  </Button>
                </Box>
              </Tooltip>
            ) : (
              <Box alignSelf="flex-end">
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={formik.isSubmitting || teamFull}
                >
                  Invite
                </Button>
              </Box>
            )}
          </Stack>
        </form>
      </Card>
    </>
  )
}
