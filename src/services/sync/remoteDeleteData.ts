import { derived } from 'svelte/store';
import { noop } from 'svelte/internal';

import { WsStates } from '$utils/wsStore';

import { userEncrStore } from '$stores/user';
import { syncConnection } from './syncConnection';
import { notYetRemoteDeletedStore } from '$stores/decr/deleted';
import { SyncService } from './syncService';

/**
 * We don't want to flood the backend with requests from all users, so we
 * only let the user who actually deleted the entity to send this request.
 *
 * Still some possibility for multiple requests (sync goes faster than the
 * request), but much less.
 */
export const remoteDeleteData = derived(
  [userEncrStore, notYetRemoteDeletedStore],
  ([$user, $deleted]) =>
    $deleted
      .filter(ent => ent.decr.initiatorId == $user?.id)
      .reduce((acc, { walletId, id, decr }) => {
        if (!acc[walletId]) acc[walletId] = { toDelete: [], ids: [] };
        acc[walletId].ids.push(id);
        acc[walletId].toDelete.push(...decr.ids);
        return acc;
      }, {} as { [walletId: string]: { toDelete: string[]; ids: string[] } }),
);

/**
 * For now I'm positive that this logic is _just fine_.
 *
 * It sends the request once every time the connection is established — it is a very strong
 * indicator that user has active internet connection.
 *
 * The request is dead simple, so the only reason it can fail is a network/server issue. In
 * either case most probably repeating query won't help and the sync would be down as well.
 * So based on this assumption we don't do anything smarter than this.
 */
export const removeRequestHandler = derived(
  [remoteDeleteData, syncConnection],
  async ([$removeData, $sync]) => {
    if ($sync?.state != WsStates.open) return;
    if (Object.keys($removeData).length > 0)
      SyncService.deleteEntities($removeData).then(noop).catch(noop);
  },
);
