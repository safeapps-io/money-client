import { derived } from 'svelte/store';

import { userEncrStore } from '$stores/user';
import { notYetRemoteDeletedStore } from '$stores/decr/deleted';
import { EntityService } from './entityService';
import { isOnline } from '$services/auth/isOnline';

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
  [isOnline, userEncrStore, notYetRemoteDeletedStore],
  async ([$isOnline, $user, $deleted]) => {
    if (!$isOnline) return;

    const toDelete: { [walletId: string]: { toDelete: string[]; ids: string[] } } = {};
    for (const { walletId, id, decr } of $deleted) {
      /**
       * We don't want to flood the backend with requests from all users, so we
       * only let the user who actually deleted the entity to send this request.
       *
       * Still some possibility for multiple requests (sync goes faster than the
       * request), but much less.
       */
      if (decr.initiatorId == $user?.id) continue;

      if (!toDelete[walletId]) toDelete[walletId] = { toDelete: [], ids: [] };
      toDelete[walletId].ids.push(id);
      toDelete[walletId].toDelete.push(...decr.ids);
    }

    if (Object.keys(toDelete).length > 0)
      EntityService.delete(toDelete).catch(e => console.error('error while deleting ents', e));
  },
);
