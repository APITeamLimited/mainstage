import React from 'react'

import * as Y from 'yjs'
import { useYMap } from 'zustand-yjs'

import { useWorkspace } from 'src/entity-engine'

import { SlashDivider } from './SlashDivider'

export const CollectionEditorNavExtension = () => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const params = new URL(document.location).searchParams
  const projectId = params.get('projectId')
  const branchId = params.get('branchId')
  const collectionId = params.get('collectionId')

  const workspace = useWorkspace()
  const collectionYMap = workspace
    ?.get('projects')
    ?.get(projectId)
    ?.get('branches')
    ?.get(branchId)
    ?.get('collections')
    ?.get(collectionId)
  const collection = useYMap(collectionYMap || new Y.Map())

  const name = collection.get('name') as string | undefined

  return name ? (
    <>
      <SlashDivider />
      <h1>{name}</h1>
    </>
  ) : (
    <></>
  )
}
