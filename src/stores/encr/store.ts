import { writable, derived } from 'svelte/store';

import { resetStore } from '$utils/persistStore';

export type EncrEntity = {
  id: string;
  created: number;
  updated: number;

  walletId: string;
  encr: string;

  clientUpdated?: number;
};
export type EncrEntityLocal = Omit<EncrEntity, 'created' | 'updated'> & {
  clientUpdated: number;
};

type EncryptedState = {
  [id: string]: EncrEntity | EncrEntityLocal;
};

export const encryptedCacheKey = 'encryptedData',
  encryptedStore = writable<EncryptedState | null>(null);

/**
 * TODO: optimize me?
 * I think it should be optimized at some point in future. Right now it seems to be too much operations.
 * It iterates on all entities on each change to encrypted store (backend/client driven).
 */
export const entityCountByWallet = derived(encryptedStore, $encr => {
  const result: { [walletId: string]: number } = {};

  if (!$encr) return result;

  for (const { walletId } of Object.values($encr)) {
    if (typeof result[walletId] == 'undefined') result[walletId] = 0;
    result[walletId] += 1;
  }
  return result;
});

export const resetEncryptedStore = () => resetStore(encryptedStore),
  bulkUpdateEncrEntity = (data: Array<EncrEntity | EncrEntityLocal>) =>
    encryptedStore.update($state => {
      const s = $state || {};
      data.forEach(ent => (s[ent.id] = ent));
      return s;
    });

export const encryptedDeleteGuard = derived(
  encryptedStore,
  $encrypted => (deletedIds: string[]) => {
    if (!$encrypted) return;
    let hasChanges = false;

    Object.values($encrypted).forEach(
      item => deletedIds.includes(item.id) && ((hasChanges = true), delete $encrypted[item.id]),
    );
    if (hasChanges) encryptedStore.set($encrypted);
  },
);
