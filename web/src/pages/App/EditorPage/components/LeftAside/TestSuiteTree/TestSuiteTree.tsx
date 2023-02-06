/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import { Stack, Box, useTheme, Button, Divider } from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { createEnvironmentDialogStateVar } from 'src/components/app/dialogs/CreateEnvironmentDialog'
import { EnvironmentIcon, MonitorIcon } from 'src/components/utils/Icons'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useSimplebarReactModule, useYJSModule } from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  focusedElementVar,
  getFocusedElementKey,
} from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { EmptyAside } from '../../shared/EmptyAside'
import { LeftAsideLayout } from '../LeftAsideLayout'

type TestSuiteTreeProps = {
  show: boolean
  testSuitesYMap: YMap<any>
}

export const TestSuiteTree = ({ show, testSuitesYMap }: TestSuiteTreeProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()
  const Y = useYJSModule()
  const testSuitesHook = useYMap(testSuitesYMap)

  useReactiveVar(activeEnvironmentVar)
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())

  const focusedElementDict = useReactiveVar(focusedElementVar)

  const showCreateEnvironmentDialog = () =>
    createEnvironmentDialogStateVar({
      isOpen: true,
      project: {
        id: (testSuitesYMap?.parent?.parent?.parent as YMap<any>).get(
          'id'
        ) as string,
      },
      hideProjectSelect: true,
    })

  return (
    <div
      style={{
        display: show ? undefined : 'none',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <LeftAsideLayout title="Test Suites">
        <Stack
          spacing={2}
          sx={{
            height: '100%',
            maxHeight: '100%',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
          }}
        >
          <Divider />
          <Box paddingX={2}>
            <Button
              variant="contained"
              size="small"
              color="info"
              onClick={showCreateEnvironmentDialog}
              sx={{
                backgroundColor: 'primary',
                width: '100%',
                height: '24px',
              }}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Box>
          <Box
            sx={{
              overflow: 'hidden',
              height: '100%',
              maxHeight: '100%',
            }}
          >
            <SimpleBar style={{ maxHeight: '100%' }}>
              {testSuitesYMap.size > 0 ? (
                <></>
              ) : (
                <EmptyAside
                  primaryText="Test Suites"
                  secondaryText="Test suites allow your to run multiple test scripts in a single run and gain deeper insights into your application."
                  icon={MonitorIcon}
                >
                  <Button
                    variant="text"
                    color="primary"
                    onClick={showCreateEnvironmentDialog}
                    sx={{
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Create Test Suite
                  </Button>
                </EmptyAside>
              )}
            </SimpleBar>
          </Box>
        </Stack>
      </LeftAsideLayout>
    </div>
  )
}
