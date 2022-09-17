/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState } from 'react'

import { Card, Stack, useTheme, Typography, Box, Button } from '@mui/material'

type FileDropzoneProps = {
  primaryText: string
  secondaryMessages?: string[]
  accept?: string
  onFiles?: (files: FileList) => void
}

export const FileDropzone = ({
  primaryText,
  secondaryMessages = [],
  accept = '*',
  onFiles,
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
      //onDrop(e)
    },
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('files', event.target.files)
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
              <>
                <Typography
                  variant="h6"
                  color={theme.palette.text.secondary}
                  gutterBottom
                >
                  Current File:
                </Typography>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                  gutterBottom
                >
                  {files[0].name}
                </Typography>
                <Typography
                  variant="body2"
                  color={theme.palette.text.secondary}
                >
                  Click here or drag and drop to change
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  variant="h6"
                  color={theme.palette.text.secondary}
                  gutterBottom={secondaryMessages.length > 0}
                >
                  {primaryText}
                </Typography>
                {secondaryMessages.map((message, index) => (
                  <Typography
                    variant="body2"
                    color={theme.palette.text.secondary}
                    key={index}
                    gutterBottom={index !== secondaryMessages.length - 1}
                  >
                    {message}
                  </Typography>
                ))}
              </>
            )}
          </Stack>
        </Card>
      </label>
    </>
  )
}
