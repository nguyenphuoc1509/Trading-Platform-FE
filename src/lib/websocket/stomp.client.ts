import { Client, type StompSubscription } from '@stomp/stompjs';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/api/ws';

let stompClient: Client | null = null;
let connecting = false;
const pendingCallbacks: (() => void)[] = [];

function getClient(): Client {
  if (!stompClient) {
    stompClient = new Client({
      // SockJS shim — dynamic import to avoid SSR crash
      webSocketFactory: () => {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const SockJS = require('sockjs-client');
        return new SockJS(WS_URL);
      },
      reconnectDelay: 3000,
      onConnect: () => {
        connecting = false;
        pendingCallbacks.splice(0).forEach((cb) => cb());
      },
      onDisconnect: () => {
        connecting = false;
      },
    });
  }
  return stompClient;
}

/** Connect once; runs callback when ready */
export function ensureConnected(onReady: () => void): void {
  const client = getClient();
  if (client.connected) {
    onReady();
    return;
  }
  pendingCallbacks.push(onReady);
  if (!connecting && !client.active) {
    connecting = true;
    client.activate();
  }
}

export function subscribe(
  topic: string,
  callback: (body: unknown) => void
): StompSubscription | null {
  const client = getClient();
  if (!client.connected) return null;
  return client.subscribe(topic, (msg) => {
    try {
      callback(JSON.parse(msg.body));
    } catch {
      // ignore malformed messages
    }
  });
}

export function publish(destination: string): void {
  getClient().publish({ destination });
}

export function disconnectStomp(): void {
  stompClient?.deactivate();
  stompClient = null;
  connecting = false;
}