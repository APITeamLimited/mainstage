/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

import { Branch, Project } from '@apiteam/types'
import { makeVar, useReactiveVar } from '@apollo/client'
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  MenuItem,
  Select,
  InputLabel,
  TextField,
  Stack,
  Box,
} from '@mui/material'
import { useFormik } from 'formik'
import type { Map as YMap } from 'yjs'
import * as Yup from 'yup'

import { useYJSModule } from 'src/contexts/imports'
import { userProjectBranchesVar } from 'src/contexts/reactives/UserBranches'
import { useWorkspace } from 'src/entity-engine'
import { createEnvironment } from 'src/entity-engine/creators'
import { useYMap } from 'src/lib/zustand-yjs'

import { findActiveBranch } from '../dashboard/ProjectOverview/utils'

type CreateEnvironmentDialogState = {
  isOpen: boolean
  project: Project | null
}

const initialCreateEnvironmentDialogState: CreateEnvironmentDialogState = {
  isOpen: false,
  project: null,
}

export const createEnvironmentDialogStateVar = makeVar(
  initialCreateEnvironmentDialogState
)

export function CreateEnvironmentDialog() {
  const Y = useYJSModule()

  const { isOpen, project } = useReactiveVar(createEnvironmentDialogStateVar)
  const workspace = useWorkspace()
  const projects = useYMap<Project, Record<string, Project>>(
    workspace?.getMap('projects') || new Y.Map()
  )

  const userProjectBranches = useReactiveVar(userProjectBranchesVar)

  const getProjectIndex = () => {
    if (!project) {
      return -1
    }

    return Object.entries(projects.data).findIndex(
      ([, p]) => p.id === project.id
    )
  }

  const projectIndex = getProjectIndex()

  const formik = useFormik({
    initialValues: {
      name: 'New Environment',
      projectIndex: projectIndex,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(25).required('Environments must have a name'),
    }),
    onSubmit: async (values): Promise<void> => {
      const { environment, environmentId } = createEnvironment(values.name, Y)
      const projectData = Object.entries(projects.data).find(
        (r, i) => i === values.projectIndex
      )

      if (!projectData) throw new Error('Project not found')
      const projectYMap = workspace?.getMap('projects').get(projectData[0])
      if (!projectYMap) throw new Error('Project not found')

      const branches = (projectYMap as Y.Map<unknown>).get(
        'branches'
      ) as YMap<any>

      let branchValues = {} as Record<string, Branch>

      branches.forEach((b) => {
        const id = b.get('id')
        branchValues = {
          ...branchValues,
          [id]: {
            id: b.get('id'),
            name: b.get('name'),
          },
        }
      })

      // Now need to find correct branch for this project
      const activeBranch = findActiveBranch({
        branches: branchValues,
        userProjectBranches,
        project: projectData[1],
      })

      if (!activeBranch) throw new Error('No active branch found')

      const branchYMap = branches.get(activeBranch.id)
      if (!branchYMap) throw new Error('No branch found')

      const environments = (branchYMap as YMap<any>).get('environments')
      environments.set(environmentId, environment)
      handleClose()
    },
  })

  useEffect(() => {
    formik.setFieldValue('projectIndex', projectIndex)
    // This seems to be necessary to preent a feedback loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIndex])

  const handleClose = () => {
    createEnvironmentDialogStateVar({
      isOpen: false,
      project: null,
    })
    formik.resetForm()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="xs" fullWidth>
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>New Environment</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>
            <Box>
              <InputLabel
                id="projectIdSelectLabel"
                sx={{
                  marginBottom: 1,
                }}
              >
                Project
              </InputLabel>
              <Select
                name="projectIndex"
                labelId="projectIdSelectLabel"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.projectIndex}
                error={Boolean(
                  formik.touched.projectIndex && formik.errors.projectIndex
                )}
                defaultValue={projectIndex}
                title="Project"
                fullWidth
                size="small"
              >
                {Object.entries(projects.data).map(([, project], index) => (
                  <MenuItem key={index} value={index}>
                    {project.name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
            <TextField
              label="Environment Name"
              name="name"
              value={formik.values.name}
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              error={Boolean(formik.touched.name && formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
              variant="outlined"
              size="small"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
