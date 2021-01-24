import { readable } from 'svelte/store';

export type WsSendMessage = (message: Object) => void;
export type WsHandler = (message: Object) => void;

export enum WsStates {
  connecting = 'c',
  open = 'o',
  closed = 'cl',
}

const permanentCloseCode = 4999;
export const wsStore = (path: string, handleMessage: WsHandler) =>
  readable<{
    state: WsStates;
    sendMessage: WsSendMessage;
    closeConnection: (permanent: boolean) => void;
    delayMs: number;
  } | null>(null, set => {
    let delayMs = 1000,
      ws: WebSocket,
      state: WsStates = WsStates.closed;

    const update = () => set({ state, sendMessage, closeConnection, delayMs }),
      reconnect = () => {
        if (state === WsStates.connecting) ws.close();

        if (state !== WsStates.open) {
          state = WsStates.connecting;
          ws = new WebSocket(path);

          ws.onclose = e => {
            state = WsStates.closed;
            if (e.code !== permanentCloseCode) {
              setTimeout(reconnect, delayMs);
              delayMs = delayMs >= 32 * 1000 ? delayMs : delayMs * 2;
            }
            update();
          };

          ws.onerror = err => {
            console.error('Socket encountered error, closing socket', err);
            ws.close();
          };

          ws.onmessage = e => {
            const message = JSON.parse(e.data);
            if (message.type === 'start') {
              state = WsStates.open;
              delayMs = 1000;
              update();
            } else handleMessage(message);
          };

          update();
        }
      },
      sendMessage = (message: { type: string; data: any }) => {
        if (state === WsStates.open) {
          ws.send(JSON.stringify(message));
        }
      },
      closeConnection = (permanent = true) => ws.close(permanent ? permanentCloseCode : undefined);

    reconnect();

    return closeConnection;
  });
