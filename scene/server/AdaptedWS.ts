import { IWebSocketEventMap } from "decentraland-api";
import { ScriptingTransport } from "decentraland-rpc/lib/common/json-rpc/types";
import { ErrorEvent } from "ws";


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

export function AdaptedWebSocketTransport(socket: IAdaptedWebSocket): ScriptingTransport {
    const queue: (string | Uint8Array | ArrayBuffer | SharedArrayBuffer)[] = []
  
    socket.addEventListener('open', function() {
      flush()
    })
  
    function flush() {
      if (socket.readyState === socket.OPEN) {
        queue.forEach($ => send($))
        queue.length = 0
      }
    }
  
    function send(msg: string | Uint8Array | ArrayBuffer | SharedArrayBuffer) {
      if (typeof msg === 'string') {
        socket.send(msg, { binary: false })
      } else if (msg instanceof Uint8Array || msg instanceof ArrayBuffer || msg instanceof SharedArrayBuffer) {
        // tslint:disable-next-line:semicolon
        ;(socket as any).binaryType = 'arraybuffer'
        socket.send(msg, { binary: true })
      }
    }
  
    const api: ScriptingTransport = {
      onConnect(handler) {
        if (socket.readyState === socket.OPEN) {
          handler()
        } else {
          socket.addEventListener('open', () => handler(), { once: true })
        }
      },
      onError(handler) {
        socket.addEventListener('error', (err: ErrorEvent) => {
          if (err.error) {
            handler(err.error)
          } else if (err.message) {
            handler(
              Object.assign(new Error(err.message), {
                colno: err.target,
                error: err.error,
                filename: err.type,
                message: err.message
              })
            )
          }
        })
      },
      onMessage(handler) {
        socket.addEventListener('message', (message: { data: any }) => {
          handler(message.data)
        })
      },
      sendMessage(message: any) {
        const toSend = message instanceof Uint8Array ? message.buffer : message
  
        if (socket.readyState === socket.OPEN) {
          send(toSend)
        } else {
          queue.push(toSend)
        }
      },
      close() {
        socket.close()
      }
    }
  
    return api
  }