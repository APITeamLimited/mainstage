import {
  rawGetMessagesState,
  rawTestInfoIdExists,
  rawGetLocations,
  rawAddMessage,
} from '../datapeak-raw/pkg/datapeak'

export const getMessages = rawGetLocations as (testInfoId: string) => string[]

export const addMessage = rawAddMessage as (
  testInfoId: string,
  message: string
) => void

export class MessagesPoller {
  private state = ''
  private intervalId: NodeJS.Timeout | null = null
  private readonly pollInterval: number
  private readonly callback: (messages: string[]) => void
  private readonly testInfoId: string

  constructor(
    testInfoId: string,
    callback: (messages: string[]) => void,
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
    const newState = rawGetMessagesState(this.testInfoId)
    if (newState !== this.state) {
      this.state = newState
      this.callback(getMessages(this.testInfoId))
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
