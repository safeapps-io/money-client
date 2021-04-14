import { readable } from 'svelte/store';

import { apiPath } from '$services/config';

/**
 * Super simple.
 * They say browser often fails to determine if it is offline, so we probably would
 * have to do some ping-pong SSE connection.
 * https://stackoverflow.com/a/27840379
 *
 * But for now this is sufficient enough.
 */
export const isOnline = readable<boolean>(false, set => {
  const evt = new EventSource(`${apiPath}/auth/user/updates`, { withCredentials: true });

  evt.onopen = () => set(true);
  evt.onerror = () => set(false);

  return () => evt.close();
});
