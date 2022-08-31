import * as Y from 'yjs'

import { SocketIOProvider } from './socket-io-provider'

type EntityManagerNewProps = {
  socketioProvider: SocketIOProvider | null
}

export class SocketIOManager extends React.Component {
  socketioProvider: SocketIOProvider | null

  constructor(props: EntityManagerNewProps) {
    super(props)
    this.socketioProvider = props.socketioProvider
  }

  componentWillUnmount() {
    console.log('SocketIOManager unmounting')
    this.socketioProvider?.disconnect()
    this.socketioProvider?.destroy()
  }

  render() {
    return null
  }
}
