import * as Y from 'yjs'

import { SocketIOProvider } from './socket-io-provider'

type EntityManagerNewProps = {
  children?: React.ReactNode
  socketioProvider: SocketIOProvider | null
}

export class SocketIOManager extends React.Component {
  children?: React.ReactNode
  socketioProvider: SocketIOProvider | null

  constructor(props: EntityManagerNewProps) {
    super(props)
    this.children = props.children
    this.socketioProvider = props.socketioProvider
  }

  componentWillUnmount() {
    console.log('SocketIOManager componentWillUnmount')
    this.socketioProvider?.disconnect()
    this.socketioProvider?.destroy()
  }

  render() {
    return this.children
  }
}
