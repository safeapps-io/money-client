import { derived } from 'svelte/store';

import { walletStore } from '@/stores/wallet';

import { bulkDeleteEncrEntities } from '@/stores/encr/operations';
import { encryptedStore, encryptedDeleteGuard } from '@/stores/encr/store';

import { flatMappedDeletedStore } from '@/stores/decr/deleted';
import { walletDataDeleteGuard } from '@/stores/decr/wallet';
import { transactionDeleteGuard } from '@/stores/decr/transaction';
import { referenceTransactionDeleteGuard } from '@/stores/decr/referenceTransaction';
import { assetDeleteGuard } from '@/stores/decr/asset';
import { categoryDeleteGuard } from '@/stores/decr/category';
import { correctionTransactionDeleteGuard } from '@/stores/decr/correctionTransaction';
import { searchFilterDeleteGuard } from '@/stores/decr/searchFilter';

/**
 * Removes encrypted wallet data for wallets that are not present in wallet store.
 */
export const walletEncryptedDataCleaner = derived(
  [walletStore, encryptedStore],
  ([$wallet, $encrypted]) => {
    /**
     * FIXME: delete decrypted data if it exists.
     * The deleted wallet can be opened at the time, so we should delete decrypted data as well.
     */

    if (!$wallet || !$encrypted) return;

    const myWalletIds = Object.keys($wallet),
      idsToDelete = Object.values($encrypted)
        .filter(ent => !myWalletIds.includes(ent.walletId))
        .map(ent => ent.id);

    if (idsToDelete.length) bulkDeleteEncrEntities(idsToDelete);
  },
);

/**
 * IDEA: obsoleteDeletedRecordDataCleaner. At some point in time a deletedRecord most probably
 * becomes obsolete, it is just stored for consistency, but all the clients are synced by the time.
 * So maybe we should just delete them here and on remote if it hasn't been updated for a while.
 */

const runGuardAgainstFlatMappedStore = ([$deleted, $guardFn]: [
  {
    [walletId: string]: string[];
  },
  (walletId: string, deletedIds: string[]) => void,
]) => Object.entries($deleted).forEach(([walletId, deletedIds]) => $guardFn(walletId, deletedIds));

export const assetCleaner = derived(
    [flatMappedDeletedStore, assetDeleteGuard],
    runGuardAgainstFlatMappedStore,
  ),
  categoryCleaner = derived(
    [flatMappedDeletedStore, categoryDeleteGuard],
    runGuardAgainstFlatMappedStore,
  ),
  correctionTransactionCleaner = derived(
    [flatMappedDeletedStore, correctionTransactionDeleteGuard],
    runGuardAgainstFlatMappedStore,
  ),
  referenceTransactionCleaner = derived(
    [flatMappedDeletedStore, referenceTransactionDeleteGuard],
    runGuardAgainstFlatMappedStore,
  ),
  searchFilterCleaner = derived(
    [flatMappedDeletedStore, searchFilterDeleteGuard],
    runGuardAgainstFlatMappedStore,
  ),
  transactionCleaner = derived(
    [flatMappedDeletedStore, transactionDeleteGuard],
    runGuardAgainstFlatMappedStore,
  ),
  walletDataCleaner = derived(
    [flatMappedDeletedStore, walletDataDeleteGuard],
    runGuardAgainstFlatMappedStore,
  );

export const encrCleaner = derived(
  [flatMappedDeletedStore, encryptedDeleteGuard],
  ([$deleted, $encryptedGuardFn]) => $encryptedGuardFn(Object.values($deleted).flatMap(ent => ent)),
);
