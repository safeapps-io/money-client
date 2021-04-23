import { derived, get } from 'svelte/store';

import { getSortedStore } from '$utils/getSortedStore';

import type { Transaction } from './types';
import { EntityTypes } from './types';
import type { StoreData } from './base';
import { createDecrEntityStore } from './base';

export const {
  store: transactionStore,
  currentWalletStore: currentWalletTransactionStore,
  add: transactionAdd,
  bulkAdd: transactionBulkAdd,
  overwrite: transactionOverwrite,
  update: transactionUpdate,
  bulkUpdate: transactionBulkUpdate,
  deletedDataConsistencyGuardStore: transactionDeleteGuard,
} = createDecrEntityStore<Transaction>(EntityTypes.transaction, (ent, deletedEntityIds) =>
  ent.decr.categoryId && deletedEntityIds.includes(ent.decr.categoryId)
    ? ((ent.decr.categoryId = null), ent)
    : null,
);

export const transactionSortedByDatetimeStore = getSortedStore(
    currentWalletTransactionStore,
    (tr1, tr2) => tr1.decr.datetime - tr2.decr.datetime,
  ),
  draftTransactionStore = derived(transactionSortedByDatetimeStore, $transactions =>
    $transactions.filter(tr => tr.decr.isDraft),
  );

/**
 * A map of category id to the amount of transactions that has this category.
 */
export const noCategoryKey = '_',
  transactionCountByCategoryStore = derived(transactionSortedByDatetimeStore, $transactions =>
    $transactions.reduce((res, tr) => {
      const categoryId = tr.decr.categoryId ?? noCategoryKey;
      if (!res[categoryId]) res[categoryId] = 0;
      res[categoryId] += 1;
      return res;
    }, {} as { [categoryId: string]: number }),
  );

/**
 * A set of all the tags ever used.
 */
export const distinctTagNamesStore = derived(transactionSortedByDatetimeStore, $transactions => {
  const res = new Set<string>();
  $transactions.forEach(tr => tr.decr.tags && tr.decr.tags.forEach(tag => res.add(tag)));
  return res;
});

export const bulkReplaceCategories = ({
  walletId,
  oldCategoryId,
  newCategoryId,
}: {
  walletId: string;
  oldCategoryId: string;
  newCategoryId: string;
}) =>
  transactionBulkUpdate(
    Object.values((get(transactionStore) as StoreData<Transaction>)[walletId] || {})
      .filter(ent => ent.decr.categoryId == oldCategoryId)
      .map(ent => ({ ent, decr: { ...ent.decr, categoryId: newCategoryId } })),
  );
