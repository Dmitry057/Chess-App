import { createServer } from 'http'
import { Server as WebSocketServer} from 'ws'
import { connectedClients } from './ConnectedClients'
import RemoteScene from './RemoteScene'
import store, { unregisterPlayer } from './Store'
import { ScriptingTransport } from 'decentraland-rpc/lib/common/json-rpc/types'
import { IWebSocketEventMap } from 'decentraland-api'

export interface IAdaptedWebSocket {
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
    readyState: number;
    close(code?: number, data?: string): void;
    send(data: any, cb?: ((err: Error | undefined) => void) | undefined): void;
    send(data: any, options: any, cb?: (err: Error) => void): void;
    terminate?(): void;
    addEventListener<K extends keyof IWebSocketEventMap>(type: K, listener: (ev: IWebSocketEventMap[K]) => any, options?: any): void;
}
export declare function AdaptedWebSocketTransport(socket: IAdaptedWebSocket): ScriptingTransport;

const express = require('express')
const cors = require('cors')

const app = express()

app.use(cors())

const server = createServer(app)
const wss = new WebSocketServer({ server })


wss.on('connection', function connection(ws, req) {

  const client = new RemoteScene(AdaptedWebSocketTransport(ws))
  client.on('error', (err: Error) => {
    console.error(err)
    ws.close()
  })

  connectedClients.add(client)

  ws.on('close', () => {
    connectedClients.delete(client)
    store.dispatch(unregisterPlayer(client.id))
  })

  console.log(`Client connected at ${req.connection.remoteAddress}`)
})

server.listen(8087, function listening() {
  console.log(`Listening on 8087`)
})
