/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useEffect, useMemo, useState } from 'react'

import ClearIcon from '@mui/icons-material/Clear'
import {
  Card,
  Stack,
  useTheme,
  Typography,
  Chip,
  Box,
  IconButton,
} from '@mui/material'

export type FileDropzoneProps = {
  primaryText: string
  secondaryMessages?: string[]
  accept?: string
  onFiles?: (files: FileList) => void
  children?: React.ReactNode
  overrideFileName?: string | null
  onDelete: () => void
  isSmall?: boolean
}

export const FileDropzone = ({
  primaryText,
  secondaryMessages = [],
  accept = '*',
  onFiles,
  children,
  overrideFileName,
  onDelete,
  isSmall,
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

      if (files && files?.length > 0) {
        onFiles?.(e.dataTransfer.files)
      }
    },
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (event.target.files?.length > 0) {
        onFiles?.(event.target.files)
      }

      setFiles(event.target.files)
    }
  }

  const displayFileName = useMemo(() => {
    if (overrideFileName !== undefined) return overrideFileName

    if (files && files.length > 0) {
      return files[0].name
    }
    return null
  }, [files, overrideFileName])

  return (
    <>
      <input
        onChange={handleChange}
        accept={accept}
        id="file-upload"
        type="file"
        style={{ display: 'none' }}
        // Required to prevent wrongful denial if filename already added
        key={files?.length}
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
            height: 'calc(100% - 4px)',
            // Transition border color on hover
            transition: 'border-color 0.2s ease-in-out',
            pointerEvents: 'none',
          }}
          elevation={0}
        >
          <Stack
            sx={{
              height: '100%',
            }}
          >
            {displayFileName && (
              <Box
                sx={{
                  display: 'flex',
                  // Align to right
                  justifyContent: 'flex-end',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    margin: '-17px',
                    position: 'relative',
                    top: '18px',
                    left: '-18px',
                    // Re-enable pointer events on the delete button
                    pointerEvents: 'auto',
                  }}
                >
                  <IconButton
                    onClick={(event) => {
                      event.stopPropagation()
                      event.preventDefault()
                      onDelete()
                    }}
                    size="small"
                    sx={{
                      alignSelf: 'flex-end',
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              </Box>
            )}
            <Stack
              sx={{
                display: 'flex',
                alignItems: isSmall ? 'flex-start' : 'center',
                justifyContent: 'center',
                height: '100%',
                width: '100%',
                overflow: 'hidden',
                userSelect: 'none',
                paddingX: isSmall && displayFileName ? 1 : 0,
              }}
            >
              {displayFileName ? (
                isSmall ? (
                  <Chip
                    label={displayFileName}
                    variant="outlined"
                    size="small"
                    sx={{
                      maxWidth: '150px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  />
                ) : (
                  <Stack spacing={1} alignItems="center">
                    <Typography
                      variant="h6"
                      color={theme.palette.text.secondary}
                    >
                      Current File:
                    </Typography>
                    <Chip
                      label={displayFileName}
                      variant="outlined"
                      size="small"
                      sx={{
                        maxWidth: '184px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    />
                    <Typography
                      variant="body2"
                      color={theme.palette.text.secondary}
                    >
                      Click here or drag and drop to change
                    </Typography>
                  </Stack>
                )
              ) : (
                <>
                  <Typography
                    variant={isSmall ? 'body2' : 'h6'}
                    color={theme.palette.text.secondary}
                    gutterBottom={secondaryMessages.length > 0 || !!children}
                    sx={{
                      alignSelf: 'center',
                    }}
                  >
                    {primaryText}
                  </Typography>
                  {!isSmall &&
                    secondaryMessages.map((message, index) => (
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
          </Stack>
        </Card>
      </label>
    </>
  )
}
