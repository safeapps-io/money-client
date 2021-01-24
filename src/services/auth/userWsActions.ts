import { derived } from 'svelte/store';

import { WsStates } from '@/utils/wsStore';
import { syncConnection, stateChangeHappen } from '@/services/sync/syncConnection';
import { userEncrStore } from '@/stores/user';

const enum ClientTypes {
  incrementalUpdate = 'user/incrementalUpdate',
}

/**
 * `syncConnectionStore` updates for every new token.
 * We only want to resend the data, if connection state has been toggled or user encr
 * has been changed.
 */
let lastUserSync: { state: WsStates; encr: string | null } | null;
export const syncUser = derived([syncConnection, userEncrStore], ([$sync, $user]) => {
  if (!$sync || !$user) {
    // Very viable for user switch or socket closing logic. We reset the value to
    // eliminate the possibility of stale caches
    return (lastUserSync = null);
  }

  const curr = { state: $sync.state, encr: $user.encr };
  if (stateChangeHappen(curr, lastUserSync))
    $sync.sendMessage({
      type: ClientTypes.incrementalUpdate,
      data: $user.clientUpdated ? { encr: $user.encr, clientUpdated: $user.clientUpdated } : null,
    });

  lastUserSync = curr;
});
