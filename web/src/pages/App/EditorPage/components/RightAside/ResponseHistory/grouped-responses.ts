import { createContext, useContext } from 'react'

import type { Map as YMap } from 'yjs'

export type GroupedResponses = {
  [key: string]: YMap<any>[]
}

export type GroupedResponsesContext = {
  groupedResponses: GroupedResponses
  handleDeleteResponse: (responseId: string) => void
  handleDeleteAllResponses: () => void
}

export const GroupedResponseContext = createContext<GroupedResponsesContext>({
  groupedResponses: {},
  handleDeleteResponse: () => {},
  handleDeleteAllResponses: () => {},
})

export const useGroupedResponses = () => useContext(GroupedResponseContext)

// Groups requests by time, less than a day group by hour, more than a day group by day
export const groupResponses = (responses: YMap<any>[]): GroupedResponses => {
  // Sort most recent first
  responses.sort((a, b) => {
    const aDate = new Date(a.get('createdAt'))
    const bDate = new Date(b.get('createdAt'))
    return bDate.getTime() - aDate.getTime()
  })

  const groupedResponses: GroupedResponses = {}
  const currentDate = new Date()

  responses.forEach((response) => {
    // If less than a day, group by hour
    if (
      currentDate.getTime() - new Date(response.get('createdAt')).getTime() <
      1000 * 60 * 60 * 24
    ) {
      const hoursAgo =
        (currentDate.getTime() -
          new Date(response.get('createdAt')).getTime()) /
        1000 /
        60 /
        60

      let timeLabel = ''

      if (hoursAgo < 1) {
        timeLabel = 'Less than an hour ago'
      } else {
        timeLabel = `${Math.round(hoursAgo)} hours ago`
      }

      if (!groupedResponses[timeLabel]) {
        groupedResponses[timeLabel] = []
      }

      groupedResponses[timeLabel].push(response)
    } else {
      // If more than a day, group by day
      const daysAgo =
        (currentDate.getTime() -
          new Date(response.get('createdAt')).getTime()) /
        1000 /
        60 /
        60 /
        24

      const timeLabel = `${Math.round(daysAgo)} days ago`

      if (!groupedResponses[timeLabel]) {
        groupedResponses[timeLabel] = []
      }

      groupedResponses[timeLabel].push(response)
    }
  })

  return groupedResponses
}
