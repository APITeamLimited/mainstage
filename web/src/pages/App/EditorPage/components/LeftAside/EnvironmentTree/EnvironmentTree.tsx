/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import AddIcon from '@mui/icons-material/Add'
import { Stack, Box, useTheme, Button, Divider } from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { createEnvironmentDialogStateVar } from 'src/components/app/dialogs/CreateEnvironmentDialog'
import { EnvironmentIcon } from 'src/components/utils/Icons'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import { useSimplebarReactModule, useYJSModule } from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  focusedElementVar,
  getFocusedElementKey,
} from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { EmptyAside } from '../../utils/EmptyAside'
import { LeftAsideLayout } from '../LeftAsideLayout'

import { EnvironmentTreeItem } from './EnvironmentTreeItem'

type EnvironmentTreeProps = {
  show: boolean
  environmentsYMap: YMap<any>
}

export const EnvironmentTree = ({
  show,
  environmentsYMap,
}: EnvironmentTreeProps) => {
  const { default: SimpleBar } = useSimplebarReactModule()
  const Y = useYJSModule()
  const environmentsHook = useYMap(environmentsYMap)

  useReactiveVar(activeEnvironmentVar)
  const activeEnvironmentYMap = useActiveEnvironmentYMap()
  const activeEnvironmentHook = useYMap(activeEnvironmentYMap ?? new Y.Map())

  const focusedElementDict = useReactiveVar(focusedElementVar)

  const showCreateEnvironmentDialog = () =>
    createEnvironmentDialogStateVar({
      isOpen: true,
      project: {
        id: (environmentsYMap?.parent?.parent?.parent as YMap<any>).get(
          'id'
        ) as string,
      },
      hideProjectSelect: true,
    })

  const environments = useMemo(() => {
    const rawYMaps = Array.from(environmentsYMap.values()) as YMap<any>[]

    return rawYMaps.map((yMap) => {
      const name = yMap.get('name')
      const id = yMap.get('id')

      return {
        name,
        id,
        focused: focusedElementDict[getFocusedElementKey(yMap)] === yMap,
        active: activeEnvironmentYMap === yMap,
        yMap,
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentsHook, activeEnvironmentHook])

  return (
    <div
      style={{
        display: show ? undefined : 'none',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <LeftAsideLayout title="Environments">
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
              {environments.length > 0 ? (
                environments.map((environment) => (
                  <EnvironmentTreeItem
                    key={environment.id}
                    environment={environment}
                    branchYMap={environmentsYMap.parent as YMap<any>}
                    onDelete={() => environmentsYMap.delete(environment.id)}
                    onDuplicate={() => {
                      const newId = uuid()
                      const newName = `${environment.name} (copy)`

                      const newEnvironmentYMap = environment.yMap.clone()

                      newEnvironmentYMap.set('id', newId)
                      newEnvironmentYMap.set('name', newName)

                      environmentsYMap.set(newId, newEnvironmentYMap)
                    }}
                  />
                ))
              ) : (
                <EmptyAside
                  primaryText="No Environments"
                  secondaryText="Environments store frequently used variables for use in requests and scripts"
                  icon={EnvironmentIcon}
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
                    Create Environment
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
