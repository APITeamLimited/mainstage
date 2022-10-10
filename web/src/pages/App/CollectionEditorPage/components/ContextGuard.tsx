import { useReactiveVar } from '@apollo/client'

import { useCollection } from 'src/contexts/collection'
import {
  clearFocusedRESTResponse,
  focusedResponseVar,
} from 'src/contexts/focused-response'
import { useYJSModule } from 'src/contexts/imports'
import {
  clearFocusedElement,
  focusedElementVar,
  getFocusedElementKey,
} from 'src/contexts/reactives'
import { useYMap } from 'src/lib/zustand-yjs'

type FocusGuardProps = {
  children?: React.ReactNode
}

/*
export const FocusGuard = ({ children }: FocusGuardProps) => {
  const Y = useYJSModule()

  const focusedElementDict = useReactiveVar(focusedElementVar)
  const focusedResponseDict = useReactiveVar(focusedResponseVar)
  const collectionYMap = useCollection()
  useYMap(collectionYMap ?? new Y.Map())

  if (!collectionYMap) {
    console.error('Collection not found')
    return <></>
  }

  const focusedElement =
    focusedElementDict[getFocusedElementKey(collectionYMap)]
  const focusedResponse =
    focusedResponseDict[getFocusedElementKey(collectionYMap)]

  if (
    focusedElement !== undefined &&
    focusedElement?.get('__typename') === undefined
  ) {
    console.log('Clearing focused element')
    clearFocusedElement(focusedElementDict, collectionYMap)
    return <></>
  }

  if (
    focusedResponse !== undefined &&
    focusedResponse?.get('__typename') === undefined
  ) {
    clearFocusedRESTResponse(focusedResponseDict, collectionYMap)
    console.log('Clearing focused response')
    return <></>
  }

  return <>{children}</>
}
*/
