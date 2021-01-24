import { writable, derived } from 'svelte/store';

import { resetStore } from '@/utils/persistStore';

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
