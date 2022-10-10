/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'

import { useReactiveVar } from '@apollo/client'
import { Divider, Typography } from '@mui/material'
import { Map as YMap } from 'yjs'

import { focusedResponseVar } from 'src/contexts/focused-response'
import { getFocusedElementKey } from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

import { RightAsideLayout } from '../RightAsideLayout'

type AboutAsideProps = {
  itemYMap: YMap<any>
  onCloseAside: () => void
}

export const AboutAside = ({ itemYMap, onCloseAside }: AboutAsideProps) => {
  const itemHook = useYMap(itemYMap)

  const title = useMemo(
    () => getPrettyInfoTitle(itemYMap),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [itemHook]
  )

  const focusedResponseDict = useReactiveVar(focusedResponseVar)

  const focusedResponseYMap = useMemo(
    () => focusedResponseDict[getFocusedElementKey(itemYMap)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [focusedResponseDict, itemHook]
  )

  return (
    <RightAsideLayout
      title={title}
      includePB
      includePX
      onCloseAside={onCloseAside}
    >
      <Typography variant="body2">
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          Item ID:
        </span>{' '}
        {itemYMap.get('id')}
      </Typography>
      <Typography variant="body2">
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          Item Type:
        </span>{' '}
        {itemYMap.get('__typename')}
      </Typography>
      <Typography variant="body2">
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          Created At:
        </span>{' '}
        {new Date(itemYMap.get('createdAt')).toLocaleString()}
      </Typography>
      <Typography variant="body2">
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          Updated At:
        </span>{' '}
        {itemYMap.get('updatedAt')
          ? new Date(itemYMap.get('updatedAt')).toLocaleString()
          : 'N/A'}
      </Typography>
      {focusedResponseYMap && (
        <>
          <Divider />
          <Typography variant="body2">
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              Response ID:
            </span>{' '}
            {focusedResponseYMap.get('id')}
          </Typography>
          <Typography variant="body2">
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              Response Type:
            </span>{' '}
            {focusedResponseYMap.get('__typename')}
          </Typography>
          <Typography variant="body2">
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              Response Subtype:
            </span>{' '}
            {focusedResponseYMap.get('__subtype')}
          </Typography>
          <Typography variant="body2">
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              Created At:
            </span>{' '}
            {new Date(focusedResponseYMap.get('createdAt')).toLocaleString()}
          </Typography>
          <Typography variant="body2">
            <span
              style={{
                fontWeight: 'bold',
              }}
            >
              Updated At:
            </span>{' '}
            {focusedResponseYMap.get('updatedAt')
              ? new Date(focusedResponseYMap.get('updatedAt')).toLocaleString()
              : 'N/A'}
          </Typography>
        </>
      )}
    </RightAsideLayout>
  )
}

export const getPrettyInfoTitle = (itemYMap: YMap<any>) => {
  if (itemYMap.get('__typename') === 'Collection') {
    return 'Collection Info'
  } else if (itemYMap.get('__typename') === 'Folder') {
    return 'Folder Info'
  } else if (itemYMap.get('__typename') === 'RESTRequest') {
    return 'Request Info'
  } else {
    return 'Info'
  }
}
