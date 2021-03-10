import { derived } from 'svelte/store';

import { DeletedEntity, EntityTypes } from './types';
import { createDecrEntityStore } from './base';

export const {
  store: deletedStore,
  add: deletedAdd,
  overwrite: deletedOverwrite,
} = createDecrEntityStore<DeletedEntity>(EntityTypes.deleted);

export const flatMappedDeletedStore = derived(deletedStore, $deleted => {
    const result: { [walletId: string]: string[] } = {};
    for (const [walletId, ent] of Object.entries($deleted)) {
      result[walletId] = Object.values(ent).flatMap(e => e.decr.ids);
    }
    return result;
  }),
  notYetRemoteDeletedStore = derived(deletedStore, $deleted =>
    Object.values($deleted)
      .flatMap(idMap => Object.values(idMap))
      .filter(ent => !ent.decr.remoteDeleted),
  );

export const markAsRemoteDeleted = (walletIdMap: { [walletId: string]: string[] }) =>
  deletedStore.update(
    $state => (
      Object.entries(walletIdMap).forEach(([walletId, ids]) => {
        ids.forEach(id => ($state[walletId][id].decr.remoteDeleted = true));
      }),
      $state
    ),
  );
