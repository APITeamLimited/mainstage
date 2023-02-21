import {
  rawGetLocationState,
  rawTestInfoIdExists,
  rawGetLocations,
} from '../datapeak-raw/pkg/datapeak'

export type Locations = string[]

export const getLocations = rawGetLocations as (
  test_info_id: string
) => Locations

export class LocationPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (state: string) => Locations
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: () => Locations,
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
    const newState = rawGetLocationState(this.testInfoId)
    if (newState !== this.state) {
      this.state = newState
      this.callback(rawGetLocations(this.testInfoId))
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
