import { createWebSocket } from "@/lib/socket.ts";
import { WSServerEvent } from "@/types/ws-server-types.ts";

interface SocketTransport {
  connect: () => void,
  disconnect: () => void,
  send: (data: unknown) => void,

  onOpen: (callback: () => void) => void,
  onMessage: (callback: (event: WSServerEvent) => void) => void,
  onClose: (callback: () => void) => void,
  onError: (callback: () => void) => void,

  isConnected: () => boolean
}

function createSocketTransport(): SocketTransport {
  let ws: WebSocket | null = null;

  let openHandler: (() => void) | null = null;
  let messageHandler: ((event: WSServerEvent) => void) | null = null;
  let closeHandler: (() => void) | null = null;
  let errorHandler: (() => void) | null = null;

  const connect = () => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      return;
    }

    ws = createWebSocket();

    ws.onopen = () => {
      console.log("Connected!");
      openHandler?.();
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as WSServerEvent;
        console.log("TRANSPORT RECEIVED:", parsed);
        messageHandler?.(parsed);
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    ws.onclose = () => {
      closeHandler?.();
      ws = null;
    };

    ws.onerror = (e) => {
      console.error("Error", e);
      errorHandler?.();
    };
  }

  const disconnect = () => {
    ws?.close();
    ws = null;
  }

  const send = (data: unknown) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    ws.send(JSON.stringify(data));
  }

  const isConnected = () => {
    return ws?.readyState === WebSocket.OPEN;
  }

  return {
    connect,
    disconnect,
    send,
    onMessage: (cb) => (messageHandler = cb),
    onOpen: (cb) => (openHandler = cb),
    onClose: (cb) => (closeHandler = cb),
    onError: (cb) => (errorHandler = cb),
    isConnected,
  };
}

export {
  type SocketTransport,
  createSocketTransport
}