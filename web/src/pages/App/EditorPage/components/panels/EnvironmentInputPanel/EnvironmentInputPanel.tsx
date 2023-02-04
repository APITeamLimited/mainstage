/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from 'react'

import { KeyValueItem } from '@apiteam/types/src'
import { useReactiveVar } from '@apollo/client'
import {
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { v4 as uuid } from 'uuid'
import type { Map as YMap } from 'yjs'

import { KeyValueEditor } from 'src/components/app/KeyValueEditor'
import {
  ActivateEnvironmentIcon,
  DeactivateEnvironmentIcon,
  EnvironmentIcon,
} from 'src/components/utils/Icons'
import { useHashSumModule } from 'src/contexts/imports'
import {
  activeEnvironmentVar,
  getBranchEnvironmentKey,
  updateActiveEnvironmentId,
} from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'
import { kvExporter, kvLegacyImporter } from 'src/utils/key-values'

import { PanelLayout } from '../../PanelLayout'
import { SaveButton } from '../RESTInputPanel/SaveButton'

import { SaveAsDialog } from './SaveAsDialog'

type EnvironmentInputPanelProps = {
  environmentYMap: YMap<any>
  setObservedNeedsSave: (needsSave: boolean, saveCallback?: () => void) => void
}

export const EnvironmentInputPanel = ({
  environmentYMap,
  setObservedNeedsSave,
}: EnvironmentInputPanelProps) => {
  const { default: hash } = useHashSumModule()
  const environmentHook = useYMap(environmentYMap)

  const [unsavedKeyValues, setUnsavedKeyValues] = useState([] as KeyValueItem[])

  const [activeTabIndex, setActiveTabIndex] = useState(0)
  const [needSave, setNeedSave] = useState(false)
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false)
  const [actionArea, setActionArea] = useState<React.ReactNode>(<></>)

  const activeEnvironmentDict = useReactiveVar(activeEnvironmentVar)

  const environmentActive = useMemo(
    () =>
      environmentYMap.get('id') ===
      activeEnvironmentDict[
        getBranchEnvironmentKey(environmentYMap.parent?.parent as YMap<any>)
      ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeEnvironmentDict, environmentHook]
  )

  const handleSetNeedSave = (needSave: boolean) => {
    setNeedSave(needSave)

    if (needSave) {
      setObservedNeedsSave(true, () => saveCallbackRef.current())
    } else {
      setObservedNeedsSave(false)
    }
  }

  // If doesn't need save, update fields automatically
  useEffect(() => {
    if (needSave) {
      return
    }

    const newKeyValues = kvLegacyImporter(
      'variables',
      environmentYMap,
      'localvalue'
    )

    // This is necessary to prevent a feedback loop
    if (hash(newKeyValues) !== hash(unsavedKeyValues)) {
      setUnsavedKeyValues(newKeyValues)

      // This seems to be required to trigger re-render
      setNeedSave(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [environmentHook])

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
  const handleFieldUpdate = <T extends any>(
    setter: (value: T) => void,
    newValue: T
  ) => {
    if (!needSave) {
      handleSetNeedSave(true)
    }

    // Call the setter after the needSave state is set to true else will try and
    // update fields automatically
    setter(newValue)
  }

  const handleSave = () => {
    environmentYMap.set(
      'variables',
      kvExporter(
        unsavedKeyValues,
        'localvalue',
        environmentYMap.doc?.guid as string
      )
    )

    environmentYMap.set('updatedAt', new Date().toISOString())

    handleSetNeedSave(false)
  }

  const handleSaveAs = (newName: string) => {
    const environmentsYMap = environmentYMap.parent as YMap<any>

    const newId = uuid()

    const clone = environmentYMap.clone()

    clone.set('id', newId)
    clone.set('name', newName)

    clone.set(
      'variables',
      kvExporter(
        unsavedKeyValues,
        'localvalue',
        environmentYMap.doc?.guid as string
      )
    )

    environmentsYMap.set(newId, clone)
  }

  const saveCallbackRef = useRef<() => void>(handleSave)
  saveCallbackRef.current = handleSave

  return (
    <>
      <SaveAsDialog
        open={showSaveAsDialog}
        onClose={() => setShowSaveAsDialog(false)}
        onSave={handleSaveAs}
      />
      <PanelLayout
        tabNames={['Variables']}
        activeTabIndex={activeTabIndex}
        setActiveTabIndex={setActiveTabIndex}
        actionArea={actionArea}
        aboveTabsArea={
          <Stack
            direction="row"
            sx={{
              width: '100%',
              maxWidth: '100%',
            }}
            alignItems="center"
            justifyContent="space-between"
          >
            <ListItem
              sx={{
                padding: 0,
                paddingLeft: 1.5,
                margin: 0,
                MarginTop: -2,
              }}
            >
              <ListItemIcon>
                <EnvironmentIcon />
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    fontWeight="bold"
                    fontSize="large"
                    sx={{
                      userSelect: 'none',
                    }}
                  >
                    {environmentYMap.get('name')}
                  </Typography>
                }
                sx={{
                  marginLeft: -2,
                  marginY: 0,
                }}
              />
            </ListItem>
            {/* 4 spacing looks better due to small icons */}
            <Stack direction="row" spacing={4} alignItems="center">
              {environmentActive ? (
                <Tooltip title="Deactivate">
                  <IconButton
                    edge="end"
                    aria-label={`environment ${environmentYMap.get(
                      'name'
                    )} actions`}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onClick={(event) => {
                      event.stopPropagation()
                      updateActiveEnvironmentId(
                        activeEnvironmentDict,
                        environmentYMap.parent?.parent as YMap<any>,
                        null
                      )
                    }}
                    size="medium"
                  >
                    <DeactivateEnvironmentIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <Tooltip title="Activate">
                  <IconButton
                    edge="end"
                    aria-label={`environment ${environmentYMap.get(
                      'name'
                    )} actions`}
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    onClick={(event) => {
                      event.stopPropagation()
                      updateActiveEnvironmentId(
                        activeEnvironmentDict,
                        environmentYMap.parent?.parent as YMap<any>,
                        environmentYMap.get('id')
                      )
                    }}
                    size="medium"
                  >
                    <ActivateEnvironmentIcon />
                  </IconButton>
                </Tooltip>
              )}
              <SaveButton
                needSave={needSave}
                onSave={handleSave}
                onSaveAs={() => setShowSaveAsDialog(true)}
              />
            </Stack>
          </Stack>
        }
      >
        {activeTabIndex === 0 && (
          <KeyValueEditor
            items={unsavedKeyValues}
            setItems={(newItems) =>
              handleFieldUpdate<KeyValueItem[]>(setUnsavedKeyValues, newItems)
            }
            namespace={`environment-${environmentYMap.get('id')}}-variables`}
            enableEnvironmentVariables={false}
            disableBulkEdit
            variant="localvalue"
            setActionArea={setActionArea}
            disableScroll
          />
        )}
      </PanelLayout>
    </>
  )
}
