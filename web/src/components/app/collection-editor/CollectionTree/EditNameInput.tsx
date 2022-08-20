import { memo, useRef } from 'react'

import { TextField } from '@mui/material'
import { useFormik } from 'formik'
import { useHotkeys } from 'react-hotkeys-hook'
import useDoubleClick from 'use-double-click'
import * as Yup from 'yup'

type EditNameInputProps = {
  name: string
  setNameCallback: (newName: string) => void
  isRenaming: boolean
  setIsRenamingCallback: (isRenaming: boolean) => void
  renamingRef: React.RefObject<HTMLDivElement | null>
  singleClickCallback: () => void
  permitDoubleClickRename?: boolean
}

export const EditNameInput = memo(
  ({
    name,
    setNameCallback,
    isRenaming,
    setIsRenamingCallback,
    renamingRef,
    singleClickCallback,
    permitDoubleClickRename = false,
  }: EditNameInputProps) => {
    const formik = useFormik({
      initialValues: {
        name,
      },
      validationSchema: Yup.object({
        name: Yup.string().required('Name is required'),
      }),
      onSubmit: (values) => {
        setNameCallback(values.name)
        formik.resetForm()
      },
    })

    /* don't seem to be working
    useHotkeys('enter', () => formik.handleSubmit())
    useHotkeys('return', () => formik.handleSubmit())
    useHotkeys('q', () => {
      console.log('esc')
      setIsRenamingCallback(false)
      formik.resetForm()
    })*/

    /*useDoubleClick(
      permitDoubleClickRename
        ? {
            onSingleClick: (event) => {
              event.stopPropagation()
              if (!isRenaming) {
                singleClickCallback()
              }
            },
            onDoubleClick: (event) => {
              event.stopPropagation()
              if (isRenaming) {
                formik.handleSubmit()
              } else {
                setIsRenamingCallback(true)
              }
            },
            ref: renamingRef,
            latency: 200,
          }
        : {
            onSingleClick: (event) => {
              event.stopPropagation()
              singleClickCallback()
            },
            ref: renamingRef,
            latency: 10,
          }
    )*/

    return (
      <div
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ref={renamingRef}
        style={{
          zIndex: 2000,
        }}
      >
        {isRenaming ? (
          <form noValidate onSubmit={formik.handleSubmit}>
            <TextField
              size="small"
              sx={{
                padding: 0,
              }}
              onClick={(event) => {
                event.stopPropagation()
              }}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.name}
              name="name"
              error={Boolean(formik.touched.name && formik.errors.name)}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              focused
              fullWidth
            />
          </form>
        ) : (
          name
        )}
      </div>
    )
  }
)
