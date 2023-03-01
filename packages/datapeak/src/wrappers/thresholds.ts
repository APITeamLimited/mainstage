import {
  rawGetThresholds,
  rawGetThresholdsState,
  rawTestInfoIdExists,
} from '../datapeak-raw/pkg/datapeak'

export type Threshold = {
  metric: string
  source: string
  abortOnFail?: boolean
  delayAbortEval?: string
}

export const getThresholds = rawGetThresholds as (
  testInfoId: string
) => Threshold[]

export class ThresholdsPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (thresholds: Threshold[]) => void
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: (thresholds: Threshold[]) => void,
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
    const newState = rawGetThresholdsState(this.testInfoId)
    if (newState !== this.state) {
      this.state = newState
      this.callback(rawGetThresholds(this.testInfoId))
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
