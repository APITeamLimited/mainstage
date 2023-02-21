import {
  rawGetConsoleMessages,
  rawTestInfoIdExists,
} from '../datapeak-raw/pkg/datapeak'

export type ConsoleMessage = {
  message: string
  level: string
  firstOccured: string
  lastOccured: string
  count: number
}

export const getConsoleMessages = rawGetConsoleMessages as (
  test_info_id: string
) => ConsoleMessage[]

export class ConsoleMessagesPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (messages: ConsoleMessage[]) => void
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: (messages: ConsoleMessage[]) => void,
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
    const newState = JSON.stringify(rawGetConsoleMessages(this.testInfoId))
    if (newState !== this.state) {
      this.state = newState
      this.callback(rawGetConsoleMessages(this.testInfoId))
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
