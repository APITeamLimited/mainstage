/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import { Card, Stack, useTheme, Typography, Box } from '@mui/material'

type FileDropzoneProps = {
  primaryText: string
  children?: React.ReactNode
  secondaryMessages?: string[]
  accept?: string
}

export const FileDropzone = ({
  primaryText,
  secondaryMessages = [],
  children,
  accept,
}: FileDropzoneProps) => {
  const theme = useTheme()

  const dropLabel = 'DROP'

  const [labelText, setLabelText] = React.useState<string>(primaryText)
  const [isDragOver, setIsDragOver] = React.useState<boolean>(false)
  const [isMouseOver, setIsMouseOver] = React.useState<boolean>(false)
  const stopDefaults = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }
  const dragEvents = {
    onMouseEnter: () => {
      console.log('mouse enter')
      setIsMouseOver(true)
    },
    onMouseLeave: () => {
      console.log('mouse leave')
      setIsMouseOver(false)
    },
    onDragEnter: (e: React.DragEvent) => {
      console.log('drag enter')
      stopDefaults(e)
      setIsDragOver(true)
      setLabelText(e.dataTransfer.items[0].name)
    },
    onDragLeave: (e: React.DragEvent) => {
      console.log('drag leave')
      stopDefaults(e)
      setIsDragOver(false)
      setLabelText(primaryText)
    },
    onDragOver: stopDefaults,
    onDrop: (e: React.DragEvent<HTMLElement>) => {
      console.log('drop')
      stopDefaults(e)
      setLabelText(primaryText)
      setIsDragOver(false)
      //onDrop(e)
    },
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    console.log(files)
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
        //onClick={(e) => {
        //  e.stopPropagation()
        //  e.preventDefault()
        //}}
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
            <Typography
              variant="h6"
              gutterBottom={secondaryMessages.length > 0}
              color={theme.palette.text.secondary}
            >
              {primaryText}
            </Typography>
            {children}
          </Stack>
        </Card>
      </label>
    </>
  )
}
