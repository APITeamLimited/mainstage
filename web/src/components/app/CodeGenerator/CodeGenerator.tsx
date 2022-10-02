import { useEffect, useRef, useState } from 'react'

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import CloseIcon from '@mui/icons-material/Close'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import {
  Stack,
  Typography,
  Box,
  Button,
  Popover,
  MenuItem,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material'

import { MonacoEditor, MonacoSupportedLanguage } from '../MonacoEditor'

type CodeGeneratorProps = {
  availableCodeGens?: CodeGenDefinition[]
  onCloseAside: () => void
  onGenerateCode: (codeGen: CodeGenDefinition | null) => void
  codeGenerated: CodeGenerated
  monacoNamespace: string
  denyMessage?: string | null
}

export type CodeGenDefinition = {
  name: string
  lang: string
  mode: string
  caption: string
}

export type CodeGenerated =
  | {
      language: string
      value: string
    }
  | 'NONE'

export const CodeGenerator = ({
  availableCodeGens = [],
  onCloseAside,
  onGenerateCode,
  codeGenerated,
  monacoNamespace,
  denyMessage,
}: CodeGeneratorProps) => {
  const theme = useTheme()
  const [activeCodeGen, setActiveCodeGen] = useState<CodeGenDefinition | null>(
    null
  )
  const [showCodeGenPopover, setShowCodeGenPopover] = useState(false)
  const codeGenButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (availableCodeGens.length > 0) {
      setActiveCodeGen(availableCodeGens[0])
    } else {
      setActiveCodeGen(null)
    }
    setShowCodeGenPopover(false)
  }, [availableCodeGens])

  useEffect(() => {
    onGenerateCode(activeCodeGen || null)
  }, [activeCodeGen, onGenerateCode])

  return (
    <>
      <Popover
        open={showCodeGenPopover}
        anchorEl={codeGenButtonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={() => setShowCodeGenPopover(false)}
        sx={{
          mt: 1,
        }}
      >
        <Stack>
          {availableCodeGens.map((codeGen, index) => (
            <MenuItem
              key={index}
              onClick={() => {
                setActiveCodeGen(codeGen)
                setShowCodeGenPopover(false)
              }}
              selected={activeCodeGen?.name === codeGen.name}
            >
              {codeGen.caption}
            </MenuItem>
          ))}
        </Stack>
      </Popover>
      <Box
        sx={{
          height: '100%',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          overflow: 'hidden',
          padding: 2,
        }}
      >
        <Stack
          spacing={2}
          sx={{
            height: '100%',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">
              <span
                style={{
                  userSelect: 'none',
                }}
              >
                Code Generator
              </span>
            </Typography>
            <Tooltip title="Close">
              <IconButton
                onClick={onCloseAside}
                sx={{
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          {availableCodeGens.length === 0 || activeCodeGen === null ? (
            <Typography variant="body2">
              <span
                style={{
                  userSelect: 'none',
                }}
              >
                No code generators available
              </span>
            </Typography>
          ) : (
            <>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  color="info"
                  onClick={() => setShowCodeGenPopover(true)}
                  ref={codeGenButtonRef}
                  endIcon={<ArrowDropDownIcon />}
                  fullWidth
                >
                  <span
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                    }}
                  >
                    {activeCodeGen.caption}
                  </span>
                </Button>
                {codeGenerated !== 'NONE' ? (
                  <Tooltip title="Copy All">
                    <IconButton
                      size="small"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                      onClick={() =>
                        navigator.clipboard.writeText(codeGenerated.value)
                      }
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </Tooltip>
                ) : (
                  <IconButton
                    size="small"
                    sx={{
                      color: theme.palette.text.secondary,
                    }}
                    disabled
                  >
                    <ContentCopyIcon />
                  </IconButton>
                )}
              </Stack>
              {codeGenerated !== 'NONE' ? (
                <div
                  style={{
                    height: 'calc(100% - 7.5em)',
                    width: '100%',
                  }}
                >
                  <MonacoEditor
                    value={codeGenerated.value}
                    language={codeGenerated.language as MonacoSupportedLanguage}
                    readOnly
                    enableMinimap={false}
                    scrollBeyondLastLine={false}
                    wordWrap="on"
                    namespace={monacoNamespace}
                  />
                </div>
              ) : (
                <Typography variant="body2" color={theme.palette.text.primary}>
                  {denyMessage ?? 'Error generating code'}
                </Typography>
              )}
            </>
          )}
        </Stack>
      </Box>
    </>
  )
}
