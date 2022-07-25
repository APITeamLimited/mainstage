import { Observable } from 'lib0/observable'
import { io, Socket } from 'socket.io-client'

const host = 'localhost'
const port = 8912
const secure = false

type ScopeProviderConstructorArgs = {
  scopeId: string
  rawBearer: string
}

export class ScopeProvider extends Observable<string> {
  url: string
  socket: Socket

  constructor({ scopeId, rawBearer }: ScopeProviderConstructorArgs) {
    super()

    this.url = $`${
      secure ? 'wss' : 'ws'
    }://${host}:${port}/${scopeId}?bearer=${rawBearer}`

    this.socket = io(this.url)

    this.socket.on('message', (message: string) => {
      //this.emit(message)
    }
  }

}
