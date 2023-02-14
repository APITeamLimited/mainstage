import { useEffect } from 'react'

import {
  ExecutionOptions,
  EXECUTION_AGENTS,
  maxRedirectsSchema,
  REQEUST_BODY_COMPRESSIONS,
} from '@apiteam/types/src'
import { Box, Stack } from '@mui/material'

import { snackErrorMessageVar } from 'src/components/app/dialogs'
import { FormStyledInput } from 'src/components/app/FormStyledInput'
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
            description="By default, if a test contains private IPs, the localhost agent will be used, tests containing public IPs and domains are executed in the cloud. Localhost requests can't be executed in the cloud."
          />
          {/*
          Re-enable this when support for multiple scripts is added

          <CustomFormRadioGroup
            label="Multiple Scripts"
            name="multipleScripts"
            value={executionOptions.multipleScripts.toString()}
            onChange={(event) =>
              setExecutionOptions({
                ...executionOptions,
                multipleScripts: event.target.value === 'true',
              })
            }
            options={[
              {
                label: 'Disabled',
                value: 'false',
              },
              {
                label: 'Enabled',
                value: 'true',
              },
            ]}
            description="Enable compilation of multiple scripts, disable this if you don't need to use multiple scripts (reduces compilation time)."
          /> */}
          <FormStyledInput
            label="Max Redirects"
            description="Set the maximum number of redirects to follow. If set to 0, redirects will not be followed."
            onChange={(event) => {
              const result = maxRedirectsSchema.safeParse(
                parseInt(event.target.value !== '' ? event.target.value : '0')
              )

              if (!result.success) {
                snackErrorMessageVar(
                  'Invalid max redirects value, please enter a number between 0 and 10'
                )
                return
              }

              setExecutionOptions({
                ...executionOptions,
                maxRedirects: result.data,
              })
            }}
            value={executionOptions.maxRedirects.toString()}
          />
          <CustomFormRadioGroup
            label="Request Body Compression"
            name="compression"
            value={executionOptions.compression}
            onChange={(event) =>
              setExecutionOptions({
                ...executionOptions,
                compression: event.target
                  .value as ExecutionOptions['compression'],
              })
            }
            options={REQEUST_BODY_COMPRESSIONS.map((compression) => ({
              label: compression,
              value: compression,
            }))}
            description="Set request body compression for http requests. If set to gzip, Content-Type and Content-Length headers will be overwritten."
          />
        </Stack>
      </SimpleBar>
    </Box>
  )
}
