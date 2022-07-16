import { makeVar } from '@apollo/client'

import { LocalFolder, LocalRESTRequest } from 'src/contexts/reactives'

type FocusedElement = LocalRESTRequest | LocalFolder | null

const blankFocusedElement: FocusedElement = null

export const focusedElementVar = makeVar<FocusedElement>(blankFocusedElement)
