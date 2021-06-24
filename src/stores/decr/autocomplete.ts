import { metaCategoryStore } from '$stores/metaCategory';
import { derived } from 'svelte/store';
import { currentWalletCategoryStore } from './category';

import { transactionSortedByDatetimeStore } from './transaction';
import type { Transaction, FullEntity, OmitCommonFields } from './types';

export const noNestedObjectsKey = '_';

export type OccurenciesSortedByPopularity = { [whateverString: string]: string[] };
export type OccurenciesValue = { [whateverString: string]: { [categoryId: string]: number } };

export const getAutocompleteStore = (transactions: FullEntity<Transaction>[]) => {
  /**
   * Objects of code/merchant name to an object with categoryId/owner as key and number
   * of occurencies as value
   */
  const res = {
    mcc: {} as OccurenciesValue,
    merchant: {} as OccurenciesValue,
    accountNumber: {} as OccurenciesValue,

    // Complying with the above structure to simplify tooling
    categoryByPopularity: { [noNestedObjectsKey]: {} } as OccurenciesValue,
  };

  transactions.forEach(tr => mutateStateWithTransactionData(res, tr.decr));
  return res;
};

/**
 * I recommend to use the mcc, merchant and accountNumber properties with
 * `transposeCountObjectToArray` function.
 * It will help you get a sorted array of categories/users from this store.
 */
export const autocompleteDataStore = derived(
  transactionSortedByDatetimeStore,
  getAutocompleteStore,
);

export const transposeCountObjectToArray = (dataObj: OccurenciesValue) => {
  const res = {} as { [whateverString: string]: string[] };
  Object.entries(dataObj).forEach(([key, value]) => {
    res[key] = Object.entries(value)
      .sort(([_, count1], [_2, count2]) => count2 - count1)
      .map(([id]) => id);
  });
  return res;
};

const increaseKeyedObjectCount = (dataObj: OccurenciesValue, key: string, nameToSave: string) => {
  if (!dataObj[key]) dataObj[key] = {};
  if (!dataObj[key][nameToSave]) dataObj[key][nameToSave] = 0;
  dataObj[key][nameToSave] += 1;
};

export const mutateStateWithTransactionData = (
  state: ReturnType<typeof getAutocompleteStore>,
  tr: OmitCommonFields<Transaction>,
) => {
  const { categoryId, walletUserId } = tr,
    a = tr.autocomplete;

  if (!categoryId) return;

  a.mcc && increaseKeyedObjectCount(state.mcc, a.mcc, categoryId);
  a.merchant && increaseKeyedObjectCount(state.merchant, a.merchant, categoryId);
  a.accountNumber && increaseKeyedObjectCount(state.accountNumber, a.accountNumber, walletUserId);

  increaseKeyedObjectCount(state.categoryByPopularity, noNestedObjectsKey, categoryId);
};

export const getCategoryIdsBasedOnMccAndMetaCategories = derived(
  [currentWalletCategoryStore, metaCategoryStore],
  ([categories, metaCategories]) => {
    const mccToCatId = new Map<string, { id: string; weight: number }[]>();

    for (const category of Object.values(categories)) {
      const associatedMeta = metaCategories?.[category.decr.metaId || ''];
      if (!associatedMeta) continue;

      associatedMeta.assignedMcc?.forEach(({ code, weight }) => {
        const curr = mccToCatId.get(code) || [];
        curr.push({ id: category.id, weight });
        mccToCatId.set(code, curr);
      });
    }

    return (mccCode: string) =>
      (mccToCatId.get(mccCode) || []).sort((a, b) => b.weight - a.weight).map(({ id }) => id);
  },
);
