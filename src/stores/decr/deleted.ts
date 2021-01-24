import { derived } from 'svelte/store';

import { DeletedEntity, EntityTypes } from './types';
import { createDecrEntityStore } from './base';

export const {
  store: deletedStore,
  add: deletedAdd,
  overwrite: deletedOverwrite,
} = createDecrEntityStore<DeletedEntity>(EntityTypes.deleted);

export const flatMappedDeletedStore = derived(deletedStore, $deleted =>
    Object.entries($deleted).reduce(
      (acc, [walletId, ent]) => (
        (acc[walletId] = Object.values(ent).flatMap(e => e.decr.ids)), acc
      ),
      {} as { [walletId: string]: string[] },
    ),
  ),
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
