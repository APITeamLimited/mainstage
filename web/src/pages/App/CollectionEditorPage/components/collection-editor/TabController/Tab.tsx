/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Map as YMap } from 'yjs'

import type { OpenTab } from './TabController'

type TabProps = {
  openTab: OpenTab
  isActive: boolean
  setActive: () => void
}

export const Tab = ({ openTab, isActive, setActive }: TabProps) => {
  return <></>
}
