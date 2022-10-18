import { SocketIOProvider } from './socket-io-provider'

type EntityManagerNewProps = {
  socketioProvider: SocketIOProvider
}

export class SocketIOManager extends React.Component {
  socketioProvider: SocketIOProvider | null

  constructor(props: EntityManagerNewProps) {
    super(props)
    this.socketioProvider = props.socketioProvider
  }

  componentWillUnmount() {
    this.socketioProvider?.disconnect()
    this.socketioProvider?.destroy()
  }

  render() {
    return null
  }
}
