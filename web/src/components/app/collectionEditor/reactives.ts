import { makeVar } from '@apollo/client'

import { LocalRESTRequest } from 'src/contexts/reactives'

type FocusedElement = LocalRESTRequest | null

const blankFocusedElement: FocusedElement = null

export const focusedElementVar = makeVar<FocusedElement>(blankFocusedElement)
