/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { ROUTES } from '@apiteam/types'
import { useReactiveVar } from '@apollo/client'
import GridViewIcon from '@mui/icons-material/GridView'
import {
  IconButton,
  Box,
  Stack,
  Tooltip,
  useTheme,
  Divider,
} from '@mui/material'
import type { Map as YMap } from 'yjs'

import { navigate } from '@redwoodjs/router'

import {
  CollectionEditorIcon,
  EnvironmentIcon,
  MonitorIcon,
} from 'src/components/utils/Icons'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import {
  focusedElementVar,
  getFocusedElementKey,
} from 'src/contexts/reactives/FocusedElement'
import { useYMap } from 'src/lib/zustand-yjs'

import { CollectionTree } from './CollectionTree'
import { EnvironmentTree } from './EnvironmentTree'
import { TestSuiteTree } from './TestSuiteTree'

type LeftAsideProps = {
  setShowLeftAside: (showLeftAside: boolean) => void
  showLeftAside: boolean
  collectionYMap: YMap<any>
  environmentsYMap: YMap<any>
  testSuitesYMap: YMap<any>
}

type AsideType = null | 'collections' | 'environments' | 'testSuites'

export const LeftAside = ({
  setShowLeftAside,
  collectionYMap,
  showLeftAside,
  environmentsYMap,
  testSuitesYMap,
}: LeftAsideProps) => {
  const theme = useTheme()
  const focusedElementDict = useReactiveVar(focusedElementVar)
  const [activeLeftAside, setActiveLeftAside] =
    useState<AsideType>('collections')
  useActiveEnvironmentYMap()

  const collectionHook = useYMap(collectionYMap)

  const focusedElement = useMemo(
    () => focusedElementDict[getFocusedElementKey(collectionYMap)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedElementDict, collectionHook]
  ) as YMap<any> | undefined

  useEffect(() => {
    if (!focusedElement) {
      return
    }

    const typename = focusedElement.get('__typename')

    if (
      typename === 'Collection' ||
      typename === 'Folder' ||
      typename === 'RESTRequest'
    ) {
      setActiveLeftAside('collections')
    } else if (typename === 'Environment') {
      setActiveLeftAside('environments')
    }
  }, [focusedElement])

  const handleButtonClick = (aside: AsideType) => {
    if (activeLeftAside !== aside) {
      setActiveLeftAside(aside)
      setShowLeftAside(true)

      if (!showLeftAside) {
        setShowLeftAside(true)
      }
    } else {
      setActiveLeftAside(null)
      setShowLeftAside(false)
    }
  }

  return (
    <Box
      sx={{
        height: '100%',
        margin: 0,
        padding: 0,
        width: showLeftAside ? '100%' : '51px',
        maxWidth: showLeftAside ? '100%' : '51px',
        borderRadius: 0,
        overflow: 'hidden',
        position: 'absolute',
        left: 0,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Stack
        direction="row"
        sx={{
          height: '100%',
        }}
      >
        <Stack
          justifyContent="space-between"
          spacing={2}
          sx={{
            width: '50px',
            borderRight: `1px solid ${theme.palette.divider}`,
            minWidth: '50px',
            paddingY: 1,
          }}
        >
          <Stack spacing={2}>
            <Tooltip title="Dashboard" placement="right">
              <IconButton
                size="large"
                color="inherit"
                onClick={() => navigate(ROUTES.dashboard)}
              >
                <GridViewIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Collections" placement="right">
              <IconButton
                size="large"
                color={
                  activeLeftAside === 'collections' ? 'primary' : 'inherit'
                }
                onClick={() => handleButtonClick('collections')}
              >
                <CollectionEditorIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Environments" placement="right">
              <IconButton
                size="large"
                color={
                  activeLeftAside === 'environments' ? 'primary' : 'inherit'
                }
                onClick={() => handleButtonClick('environments')}
              >
                <EnvironmentIcon />
              </IconButton>
            </Tooltip>
            {/* <Tooltip title="Test Suites" placement="right">
              <IconButton
                size="large"
                color={activeLeftAside === 'testSuites' ? 'primary' : 'inherit'}
                onClick={() => handleButtonClick('testSuites')}
              >
                <MonitorIcon />
              </IconButton>
            </Tooltip> */}
          </Stack>
          <Stack spacing={2}></Stack>
        </Stack>
        <CollectionTree
          collectionYMap={collectionYMap}
          show={activeLeftAside === 'collections'}
          showEnvironmentsCallback={() => setActiveLeftAside('environments')}
        />
        <EnvironmentTree
          show={activeLeftAside === 'environments'}
          environmentsYMap={environmentsYMap}
        />
        <TestSuiteTree
          show={activeLeftAside === 'testSuites'}
          testSuitesYMap={testSuitesYMap}
        />
      </Stack>
    </Box>
  )
}
