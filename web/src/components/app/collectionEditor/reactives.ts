import { makeVar } from '@apollo/client'
import { Folder, RESTRequest } from 'types/src'

type FocusedElement = RESTRequest | Folder | null

const blankFocusedElement: FocusedElement = null

export const focusedElementVar = makeVar<FocusedElement>(blankFocusedElement)
