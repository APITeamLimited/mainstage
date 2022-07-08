import { useContext } from 'react'

import { AppBarHeightContext } from 'src/layouts/App'

export const useAppBarHeight = () => useContext(AppBarHeightContext)
