import { derived } from 'svelte/store';

import { getNonOverlappingItems } from '@/utils/array';

import { EntityTypes, IgnoredTransaction } from './types';
import { createDecrEntityStore } from './base';
import { currentWalletTransactionStore } from './transaction';

export const {
  store: ignoredTransactionStore,
  currentWalletStore: currentWalletIgnoredTransactionStore,
  add: ignoredTransactionAdd,
  overwrite: ignoredTransactionOverwrite,
  update: ignoredTransactionUpdate,
} = createDecrEntityStore<IgnoredTransaction>(EntityTypes.ignoredTransaction);

/**
 * Creates a set of hashes of transactions to be ignored during import.
 * It includes:
 * 1. hashes of ignored transactions
 * 2. hashes of added transactions
 * 3. all the OFX ids of ignored transactions
 * 4. all the OFX ids of added transactions
 */
export const transactionsToIgnoreSetStore = derived(
  [currentWalletIgnoredTransactionStore, currentWalletTransactionStore],
  ([$ignored, $transactions]) =>
    new Set(
      ([] as string[]).concat(
        Object.values($ignored).map(igTr => igTr.decr.hash || igTr.decr.id || ''),
        Object.values($transactions).map(
          tr => tr.decr.autocomplete.sourceDataHash || tr.decr.autocomplete.id || '',
        ),
      ),
    ),
);

export const updateIgnoredTransaction = (walletId: string, hashes: string[] | string) =>
  ignoredTransactionStore.update($state => {
    // Only adding items that are not yet present in the state
    getNonOverlappingItems(
      Array.isArray(hashes) ? hashes : [hashes],
      Object.values($state[walletId] || {}).map(it => it.decr.hash),
    ).forEach(hash => ignoredTransactionAdd(walletId, { hash }));
    return $state;
  });
