import { derived } from 'svelte/store';

import type { WsStates } from '$utils/wsStore';
import { syncConnection } from '$services/sync/syncConnection';

const enum ClientTypes {
  get = 'wallet/get',
}

/**
 * `syncConnectionStore` updates for every new token.
 * We only want to resend the data, if connection state has been toggled or user id
 * has been changed. Each new user id would have a new connection, so it is covered
 * by default.
 */
let lastWalletSync: WsStates | null;
export const syncWallets = derived(syncConnection, $sync => {
  if (!$sync) {
    // Very viable for user switch or socket closing logic. We reset the value to
    // eliminate the possibility of stale caches
    return (lastWalletSync = null);
  }

  if (lastWalletSync !== $sync.state) $sync.sendMessage({ type: ClientTypes.get, data: {} });

  lastWalletSync = $sync.state;
});
