import { readable } from 'svelte/store';

import { ssePath } from './config';
import { walletEventsMap } from '$services/wallet/walletEvents';
import { inviteEventsMap } from '$services/invite/inviteEvent';
import { billingEventsMap } from '$services/billing/billingEvents';
import { userEventsMap } from '$services/auth/userEvents';
import { entityEventMap } from '$services/entity/entityEvents';
import { isOnlineEventsMap } from '$services/auth/isOnline';

const eventMap = new Map([
  ...walletEventsMap,
  ...inviteEventsMap,
  ...billingEventsMap,
  ...userEventsMap,
  ...entityEventMap,
  ...isOnlineEventsMap,
]);

export const sseEndpointsStore = readable(null, () => {
  const evt = new EventSource(ssePath, { withCredentials: true });

  for (const [eventname, handler] of eventMap.entries()) {
    evt.addEventListener(eventname, (event: Event & { data?: string }) =>
      handler(event.data ? JSON.parse(event.data) : null),
    );
  }

  evt.onerror = err => console.error(`SSE error`, err);

  return () => evt.close();
});
