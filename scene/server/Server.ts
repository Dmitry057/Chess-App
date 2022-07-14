import { createServer } from 'https'
import { Server as WebSocketServer} from 'ws'
import { connectedClients } from './ConnectedClients'
import RemoteScene from './RemoteScene'
import store, { unregisterPlayer } from './Store'
import {AdaptedWebSocketTransport} from './AdaptedWS'

const express = require('express')
const cors = require('cors')

const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
const app = express()

app.use(expressCspHeader({
  policies: {
        'default-src': [expressCspHeader.SELF],
        'script-src': [SELF, INLINE, 'somehost.com'],
        'style-src': [SELF, 'mystyles.net'],
        'img-src': [expressCspHeader.SELF],
        'worker-src': [NONE],
        'block-all-mixed-content': true
    }
}));
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
