/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'

import { useReactiveVar } from '@apollo/client'
import { IconButton, Box, Stack, Tooltip, useTheme } from '@mui/material'
import type { Map as YMap } from 'yjs'

import {
  CollectionEditorIcon,
  EnvironmentIcon,
} from 'src/components/utils/Icons'
import { useActiveEnvironmentYMap } from 'src/contexts/EnvironmentProvider'
import {
  focusedElementVar,
  getFocusedElementKey,
} from 'src/contexts/reactives/FocusedElement'
import { useYMap } from 'src/lib/zustand-yjs'

import { CollectionTree } from './CollectionTree'
import { EnvironmentTree } from './EnvironmentTree'

type LeftAsideProps = {
  setShowLeftAside: (showLeftAside: boolean) => void
  showLeftAside: boolean
  collectionYMap: YMap<any>
  environmentsYMap: YMap<any>
}

type AsideType = null | 'collections' | 'environments'

export const LeftAside = ({
  setShowLeftAside,
  collectionYMap,
  showLeftAside,
  environmentsYMap,
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

  const handleCloseAside = () => {
    setActiveLeftAside(null)
    setShowLeftAside(false)
  }

  // const prettyInfoName = useMemo(
  //   () => (focusedElement ? getPrettyInfoTitle(focusedElement) : undefined),
  //   [focusedElement]
  // )

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
            paddingY: 1,
            width: '50px',
            borderRight: `1px solid ${theme.palette.divider}`,
            minWidth: '50px',
          }}
        >
          <Stack spacing={2}>
            <Tooltip title="Collections" placement="left">
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
            <Tooltip title="Environments" placement="left">
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
        {/*
        {showLeftAside &&
          focusedElement?.get('__typename') === 'RESTRequest' &&
          activeLeftAside === 'code' && (
            <RESTCodeGenerator
              requestYMap={focusedElement}
              onCloseAside={handleCloseAside}
              activeEnvironmentYMap={activeEnvironmentYMap}
              collectionYMap={collectionYMap}
            />
          )}
        {focusedElement && showLeftAside && activeLeftAside === 'info' && (
          <AboutAside
            onCloseAside={handleCloseAside}
            itemYMap={focusedElement}
          />
        )} */}
      </Stack>
    </Box>
  )
}
