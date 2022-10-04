/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Awareness } from 'y-protocols/awareness'
import type { Transaction, AbstractType, Doc as YDoc } from 'yjs'

export type YProtocols = {
  awareness: Awareness
}

export type ObserveFunc = (arg0: any, arg1: Transaction) => void
export type StopAwarenessFunction = () => void
export type StartAwarenessFunction = (
  provider: YProtocols
) => StopAwarenessFunction
export type UnMountFunction = () => void | void
export type MountFunction = (
  doc: YDoc,
  startAwareness: StartAwarenessFunction
) => UnMountFunction

export enum YDocEnum {
  GUID = 0,
  DOC = 1,
  MOUNT = 2,
  UN_MOUNT = 3,
  USE_CNT = 4,
}
export enum ObserveEnum {
  TYPE = 0,
  OBSERVE = 1,
  USE_CNT = 2,
}

export type YStore = {
  yDocs: [string, YDoc, MountFunction, UnMountFunction, number][] // guid, doc, connect function, unmount function, mounted uses
  yAwareness: [string, Awareness, unknown[]][]
  observers: [AbstractType<any>, ObserveFunc, number][] // type, observer, mounted uses
  data: [AbstractType<any>, any][] // type, data
  listenType(type: AbstractType<any>, listen: ObserveFunc): void
  unListenType(type: AbstractType<any>): void
  unMountYDoc(yDoc: YDoc): void
  mountYDoc(yDoc: YDoc, mount: MountFunction): void
  update(type: AbstractType<any>, data: any): void
}

export type AwarenessData<T> = T[]
export type AwarenessSetData<T> = (newState: Partial<T>) => void
