import { useEffect } from 'react'

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
} from '@mui/material'
import { useFormik } from 'formik'
import * as Yup from 'yup'

import {
  LocalProject,
  localProjectsVar,
  activeWorkspaceVar,
  generateLocalCollection,
  localCollectionsVar,
} from 'src/contexts/reactives'

type CreateCollectionDialogState = {
  isOpen: boolean
  project: LocalProject | null
}

const initialCreateCollectionDialogState: CreateCollectionDialogState = {
  isOpen: false,
  project: null,
}

export const createCollectionDialogStateVar = makeVar(
  initialCreateCollectionDialogState
)

export function CreateCollectionDialog() {
  const { isOpen, project } = useReactiveVar(createCollectionDialogStateVar)
  const localProjects = useReactiveVar(localProjectsVar)
  const localCollections = useReactiveVar(localCollectionsVar)
  const activeWorkspace = useReactiveVar(activeWorkspaceVar)

  const getProjectIndex = () => {
    if (!project) {
      return -1
    }

    return localProjects.findIndex((p) => p.id === project.id)
  }

  const projectIndex = getProjectIndex()

  const formik = useFormik({
    initialValues: {
      name: 'New Collection',
      projectIndex: projectIndex,
      submit: null,
    },
    validationSchema: Yup.object({
      name: Yup.string().max(25).required('Collections must have a name'),
      // Check projectId is in localProjects
      projectId: Yup.string().oneOf(
        localProjects.map((project) => project.id),
        'Project must be one of the available localProjects'
      ),
    }),
    onSubmit: async (values, helpers): Promise<void> => {
      if (activeWorkspace.__typename === 'Anonymous') {
        const newCollection = generateLocalCollection({
          parentId: localProjects.find(
            (project, index) => index === values.projectIndex
          )?.id,
          name: values.name,
        })
        localCollectionsVar(localCollections.concat(newCollection))
      }
      handleClose()
    },
  })

  useEffect(() => {
    formik.setFieldValue('projectIndex', projectIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIndex])

  const handleClose = () => {
    formik.resetForm()
    createCollectionDialogStateVar({
      isOpen: false,
      project: null,
    })
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="sm" fullWidth>
      <form noValidate onSubmit={formik.handleSubmit}>
        <DialogTitle>New Collection</DialogTitle>
        <DialogContent>
          <InputLabel id="projectIdLabel">Project</InputLabel>
          <Select
            label="Project"
            name="projectIndex"
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            value={formik.values.projectIndex}
            error={Boolean(
              formik.touched.projectIndex && formik.errors.projectIndex
            )}
            defaultValue={projectIndex}
            sx={{
              width: '100%',
            }}
          >
            {localProjects.map((project, index) => (
              <MenuItem key={index} value={index}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Collection Name"
            name="name"
            value={formik.values.name}
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            error={Boolean(formik.touched.name && formik.errors.name)}
            helperText={formik.touched.name && formik.errors.name}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit">Create</Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
