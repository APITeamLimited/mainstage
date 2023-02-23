import {
  rawGetIntervalsState,
  rawTestInfoIdExists,
} from 'src/datapeak-raw/pkg/datapeak'

export type Sink = {
  labels: Record<string, number>
}

export type Interval = {
  period: number
  sinks: Record<string, Sink>
}

/** Unlike other pollers, IntervalsPoller's callback doesn't return anything as data output is customized. */
export class IntervalsPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: () => void
  private readonly testInfoId: string

  constructor(testInfoId: string, callback: () => void, pollInterval = 1000) {
    if (!rawTestInfoIdExists(testInfoId)) {
      throw new Error(`Test info id ${testInfoId} does not exist`)
    }

    this.testInfoId = testInfoId
    this.callback = callback
    this.pollInterval = pollInterval
    this.poll()
  }

  private async poll() {
    const newState = rawGetIntervalsState(this.testInfoId)
    if (newState !== this.state) {
      this.state = newState
      this.callback()
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

export * from './summary'
export * from './time-series'
