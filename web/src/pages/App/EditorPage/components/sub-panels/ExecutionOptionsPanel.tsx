import { useEffect } from 'react'

import { ExecutionOptions, EXECUTION_AGENTS } from '@apiteam/types/src'
import { Box, Stack } from '@mui/material'

import { CustomFormRadioGroup } from 'src/components/custom-mui'
import { useSimplebarReactModule } from 'src/contexts/imports'

type ExecutionOptionsPanelProps = {
  executionOptions: ExecutionOptions
  setExecutionOptions: (options: ExecutionOptions) => void
  setActionArea: (actionArea: React.ReactNode) => void
}

export const ExecutionOptionsPanel = ({
  executionOptions,
  setExecutionOptions,
  setActionArea,
}: ExecutionOptionsPanelProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setActionArea(<></>), [])

  return (
    <Box
      sx={{
        overflow: 'hidden',
        height: '100%',
        maxHeight: '100%',
      }}
    >
      <SimpleBar
        style={{ height: '100%', maxWidth: '100%', maxHeight: '100%' }}
      >
        <Stack
          alignItems="flex-start"
          spacing={2}
          sx={{
            width: '100%',
            height: '100%',
          }}
        >
          <CustomFormRadioGroup
            label="Execution Agent"
            name="executionAgent"
            value={executionOptions.executionAgent}
            onChange={(event) =>
              setExecutionOptions({
                ...executionOptions,
                executionAgent: event.target
                  .value as ExecutionOptions['executionAgent'],
              })
            }
            options={EXECUTION_AGENTS.map((agent) => ({
              label: agent,
              value: agent,
            }))}
            description="By default, if a test contains private IPs, the localhost agent will be used, tests containing public IPs and domains are executed on the cloud. You can override this behavior here."
          />
        </Stack>
      </SimpleBar>
    </Box>
  )
}
