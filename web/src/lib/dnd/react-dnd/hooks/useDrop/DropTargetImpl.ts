import type { DropTarget } from 'web/src/components/dnd/dnd-core'

import type { DropTargetMonitor } from '../../types/index'
import type { DropTargetHookSpec } from '../types'

export class DropTargetImpl<O, R, P> implements DropTarget {
  public spec: DropTargetHookSpec<O, R, P>
  private monitor: DropTargetMonitor<O, R>

  public constructor(
    spec: DropTargetHookSpec<O, R, P>,
    monitor: DropTargetMonitor<O, R>
  ) {
    this.spec = spec
    this.monitor = monitor
  }

  public canDrop() {
    const spec = this.spec
    const monitor = this.monitor
    return spec.canDrop ? spec.canDrop(monitor.getItem(), monitor) : true
  }

  public hover() {
    const spec = this.spec
    const monitor = this.monitor
    if (spec.hover) {
      spec.hover(monitor.getItem(), monitor)
    }
  }

  public drop() {
    const spec = this.spec
    const monitor = this.monitor
    if (spec.drop) {
      return spec.drop(monitor.getItem(), monitor)
    }
    return
  }
}
