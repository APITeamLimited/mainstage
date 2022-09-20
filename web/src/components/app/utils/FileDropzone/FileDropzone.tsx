/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react'

import {
  Card,
  Stack,
  useTheme,
  Typography,
  Box,
  Button,
  Chip,
} from '@mui/material'

type FileDropzoneProps = {
  primaryText: string
  secondaryMessages?: string[]
  accept?: string
  onFiles?: (files: FileList) => void
  children?: React.ReactNode
}

export const FileDropzone = ({
  primaryText,
  secondaryMessages = [],
  accept = '*',
  onFiles,
  children,
}: FileDropzoneProps) => {
  const theme = useTheme()

  const [labelText, setLabelText] = useState<string>(primaryText)
  const [isDragOver, setIsDragOver] = useState<boolean>(false)
  const [isMouseOver, setIsMouseOver] = useState<boolean>(false)
  const stopDefaults = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const [files, setFiles] = useState<FileList | null>(null)

  const dragEvents = {
    onMouseEnter: () => {
      setIsMouseOver(true)
    },
    onMouseLeave: () => {
      setIsMouseOver(false)
    },
    onDragEnter: (e: React.DragEvent) => {
      stopDefaults(e)
      setIsDragOver(true)
      setLabelText(e.dataTransfer.items[0].name)
    },
    onDragLeave: (e: React.DragEvent) => {
      stopDefaults(e)
      setIsDragOver(false)
      setLabelText(primaryText)
    },
    onDragOver: stopDefaults,
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      stopDefaults(e)
      setLabelText(primaryText)
      setIsDragOver(false)
      setFiles(e.dataTransfer.files)
      onFiles?.(e.dataTransfer.files)
    },
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles(event.target.files)
      onFiles?.(event.target.files)
    }
  }

  return (
    <>
      <input
        onChange={handleChange}
        accept={accept}
        id="file-upload"
        type="file"
        style={{ display: 'none' }}
      />
      <label
        htmlFor="file-upload"
        {...dragEvents}
        style={{
          height: '100%',
          // Set cursor to pointer if mouse is over the dropzone
          cursor: 'pointer',
        }}
      >
        <Card
          sx={{
            borderColor: isDragOver
              ? theme.palette.primary.light
              : theme.palette.divider,
            borderStyle: 'dashed',
            borderWidth: 2,
            backgroundColor: 'transparent',
            height: '100%',
            // Transition border color on hover
            transition: 'border-color 0.2s ease-in-out',
            pointerEvents: 'none',
          }}
          elevation={0}
        >
          <Stack
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              width: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              userSelect: 'none',
            }}
          >
            {files ? (
              <Stack spacing={1} alignItems="center">
                <Typography variant="h6" color={theme.palette.text.secondary}>
                  Current File:
                </Typography>
                <Chip label={files[0].name} variant="outlined" size="small" />
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Click here or drag and drop to change
                </Typography>
              </Stack>
            ) : (
              <>
                <Typography
                  variant="h6"
                  color={theme.palette.text.secondary}
                  gutterBottom={secondaryMessages.length > 0 || !!children}
                >
                  {primaryText}
                </Typography>
                {secondaryMessages.map((message, index) => (
                  <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                    key={index}
                    gutterBottom={
                      index !== secondaryMessages.length - 1 || !!children
                    }
                  >
                    {message}
                  </Typography>
                ))}
                {children}
              </>
            )}
          </Stack>
        </Card>
      </label>
    </>
  )
}
