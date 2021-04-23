import { isOnlineStore } from '$stores/isOnline';

/**
 * Super simple.
 * They say browser often fails to determine if it is offline, so we need
 * to do some ping-pong for SSE connection.
 * https://stackoverflow.com/a/27840379
 */
let timer = 0;
export const isOnlineEventsMap = new Map([
  [
    'ping',
    (data: { timer: number }) => {
      clearTimeout(timer);
      isOnlineStore.set(true);
      timer = window.setTimeout(() => isOnlineStore.set(false), data.timer + 2000);
    },
  ],
]);
