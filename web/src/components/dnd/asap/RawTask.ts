// We wrap tasks with recyclable task objects.  A task object implements

import type { Task, TaskFn } from './types'

// `call`, just like a function.
export class RawTask implements Task {
  public task: TaskFn | null = null
  private onError: (err: any) => void
  private release: (t: RawTask) => void

  public constructor(
    onError: (err: any) => void,
    release: (t: RawTask) => void
  ) {
    this.onError = onError
    this.release = release
  }

  public call() {
    try {
      this.task && this.task()
    } catch (error) {
      this.onError(error)
    } finally {
      this.task = null
      this.release(this)
    }
  }
}
