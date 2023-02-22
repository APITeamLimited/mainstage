export type Sink = {
  labels: Record<string, number>
}

export type Interval = {
  period: number
  sinks: Record<string, Sink>
}

// export const getIntervals = rawGetIntervals as (
//   test_info_id: string
// ) => Interval[]
/*
export class IntervalsPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (intervals: Interval[]) => void
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: (intervals: Interval[]) => void,
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
    const newState = JSON.stringify(rawGetIntervals(this.testInfoId))
    if (newState !== this.state) {
      this.state = newState
      this.callback(rawGetIntervals(this.testInfoId))
    }
    this.intervalId = setTimeout(() => this.poll(), this.pollInterval)
  }

  public destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }
}*/

export * from './summary'
export * from './time-series'
