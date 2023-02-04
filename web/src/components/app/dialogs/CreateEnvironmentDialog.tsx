/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

import { Branch, Project, ROUTES } from '@apiteam/types/src'
import { makeVar, useReactiveVar } from '@apollo/client'
import {
  Button,
  MenuItem,
  Select,
  InputLabel,
  TextField,
  Box,
} from '@mui/material'
import { useFormik } from 'formik'
import type { Map as YMap } from 'yjs'
import * as Yup from 'yup'

import { useLocation } from '@redwoodjs/router'

import { CustomDialog } from 'src/components/custom-mui'
import { useYJSModule } from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  focusedElementVar,
  updateActiveEnvironmentId,
  updateFocusedElement,
} from 'src/contexts/reactives'
import { userProjectBranchesVar } from 'src/contexts/reactives/UserBranches'
import { useWorkspace } from 'src/entity-engine'
import { createEnvironment } from 'src/entity-engine/creators'
import { useYMap } from 'src/lib/zustand-yjs'

import { findActiveBranch } from '../dashboard/ProjectOverview/utils'

type CreateEnvironmentDialogState = {
  isOpen: boolean
  project: {
    id: string
  } | null
  hideProjectSelect?: boolean
}

const initialCreateEnvironmentDialogState: CreateEnvironmentDialogState = {
  isOpen: false,
  project: null,
}

export const createEnvironmentDialogStateVar = makeVar(
  initialCreateEnvironmentDialogState
)

export const CreateEnvironmentDialog = () => {
  const Y = useYJSModule()
  const { pathname } = useLocation()

  const dialogState = useReactiveVar(createEnvironmentDialogStateVar)
  const workspace = useWorkspace()
  const projects = useYMap<Project, Record<string, Project>>(
    workspace?.getMap('projects') || new Y.Map()
  )

  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)
  const focusedElementDict = useReactiveVar(focusedElementVar)

  const userProjectBranches = useReactiveVar(userProjectBranchesVar)

  const getProjectIndex = () =>
    Object.values(projects.data).findIndex(
      (project) => project.id === dialogState?.project?.id
    )

  const formik = useFormik({
    initialValues: {
      name: 'New Environment',
      projectIndex: getProjectIndex(),
    },
    validationSchema: Yup.object({
      name: Yup.string().max(25).required('Environments must have a name'),
    }),
    onSubmit: async (values): Promise<void> => {
      const { environment, environmentId } = createEnvironment(values.name, Y)
      const projectData = Object.entries(projects.data).find(
        (r, i) => i === values.projectIndex
      )

      if (!projectData) {
        console.log('Project not found', values.projectIndex)
        throw new Error('Project not found')
      }
      const projectYMap = workspace?.getMap('projects').get(projectData[0])
      if (!projectYMap) throw new Error('Project not found')

      const branches = (projectYMap as YMap<unknown>).get(
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

      // If no environments, set this one as active
      if (environments.size === 1) {
        updateActiveEnvironmentId(
          activeEnvironmentDict,
          branchYMap,
          environmentId
        )
      }

      if (pathname === ROUTES.editor) {
        updateFocusedElement(focusedElementDict, environment)
      }

      handleClose()
    },
  })

  useEffect(() => {
    formik.resetForm()
    formik.setFieldValue('projectIndex', getProjectIndex())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogState])

  const handleClose = () => {
    // Prevent visual glitch
    createEnvironmentDialogStateVar({
      ...dialogState,
      isOpen: false,
    })
  }

  const [projectNames, setProjectNames] = React.useState<
    {
      id: string
      name: string
    }[]
  >([])

  useEffect(() => {
    const observeFunction = () => {
      setProjectNames(
        Array.from(workspace?.getMap('projects').values()).map((p) => ({
          id: p.get('id'),
          name: p.get('name'),
        }))
      )
    }

    observeFunction()

    workspace?.getMap('projects').observeDeep(observeFunction)

    return () => workspace?.getMap('projects').unobserveDeep(observeFunction)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dialogState])

  return (
    <form noValidate onSubmit={formik.handleSubmit}>
      <CustomDialog
        open={dialogState.isOpen}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        title="Create Environment"
        padBody
        shrinkable
        dialogActions={
          <>
            <Button onClick={handleClose} color="secondary" variant="outlined">
              Cancel
            </Button>
            <Button
              color="primary"
              variant="contained"
              onClick={formik.submitForm}
            >
              Create
            </Button>
          </>
        }
      >
        {!dialogState.hideProjectSelect && (
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
              defaultValue={formik.values.projectIndex}
              title="Project"
              fullWidth
              size="small"
            >
              {projectNames.map((project, i) => (
                <MenuItem key={project.id} value={i}>
                  {project.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
        )}
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
      </CustomDialog>
    </form>
  )
}
