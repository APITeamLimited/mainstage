import {
  rawGetSummaryState,
  rawTestInfoIdExists,
  rawGetSummary,
} from '../../datapeak-raw/pkg/datapeak'

import type { Interval } from '.'

export const getSummary = rawGetSummary as (test_info_id: string) => Interval

export class SummaryPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (summary: Interval) => void
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: (summary: Interval) => void,
    pollInterval = 1000
  ) {
    if (!rawTestInfoIdExists(testInfoId)) {
      throw new Error(`Test info id ${testInfoId} does not exist`)
    }

    this.testInfoId = testInfoId
    this.callback = callback
    this.pollInterval = pollInterval
    this.poll()
  }

  private async poll() {
    const newState = JSON.stringify(rawGetSummaryState(this.testInfoId))
    if (newState !== this.state) {
      this.state = newState
      this.callback(getSummary(this.testInfoId))
    }
    this.intervalId = setTimeout(() => this.poll(), this.pollInterval)
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}
