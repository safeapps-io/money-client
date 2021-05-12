import { derived } from 'svelte/store';

import { stripEmoji, getSortedStore } from '$utils/getSortedStore';
import { areArraysOverlapping } from '$utils/array';

import { createDecrEntityStore } from './base';
import type { SearchFilter, FullEntity } from './types';
import { EntityTypes, SearchFilterDatePeriods } from './types';

const {
  store: searchFilterStore,
  currentWalletStore: currentWalletSearchFilterStore,
  add: _searchFilterAdd,
  overwrite: searchFilterOverwrite,
  update: _searchFilterUpdate,
  reset: searchFilterReset,
  deletedDataConsistencyGuardStore: searchFilterDeleteGuard,
} = createDecrEntityStore<SearchFilter>(EntityTypes.searchFilter, (ent, deletedEntityIds) => {
  const { oneOf, noneOf } = ent.decr.parameters.category,
    oneOfOverlap = areArraysOverlapping(deletedEntityIds, oneOf),
    noneOfOverlap = areArraysOverlapping(deletedEntityIds, noneOf);

  if (oneOfOverlap)
    ent.decr.parameters.category.oneOf = oneOf.filter(val => !deletedEntityIds.includes(val));

  if (noneOfOverlap)
    ent.decr.parameters.category.noneOf = noneOf.filter(val => !deletedEntityIds.includes(val));

  return oneOfOverlap || noneOfOverlap ? ent : null;
});

export {
  searchFilterStore,
  currentWalletSearchFilterStore,
  searchFilterOverwrite,
  searchFilterDeleteGuard,
  searchFilterReset,
};

export const addDefaultSearchFilter = (walletId: string) =>
    _searchFilterAdd(walletId, {
      name: '',
      protected: true,
      group: SearchFilterDatePeriods.all,
      parameters: { category: { oneOf: [], noneOf: [] }, tag: { oneOf: [], noneOf: [] } },
    }),
  /**
   * Overwriting the `protected` to prevent strange cases where we overwrite the default search or
   * create new indestructible items.
   *
   * We only allow overwriting the `group` value for the protected filter.
   */
  searchFilterAdd: typeof _searchFilterAdd = (walletId, decr) =>
    _searchFilterAdd(walletId, { ...decr, protected: false }),
  searchFilterUpdate: typeof _searchFilterUpdate = async ({ ent, decr }) =>
    _searchFilterUpdate({
      decr: ent.decr.protected ? { ...ent.decr, group: decr.group } : { ...decr, protected: false },
      ent,
    });

export const getDefaultSearchFromWalletState = (state: {
  [id: string]: FullEntity<SearchFilter>;
}) => Object.values(state).find(searchFilter => searchFilter.decr.protected);

export const searchFilterSortedByTitleStore = derived(
    getSortedStore(
      currentWalletSearchFilterStore,
      // Protected search is always on top; the rest is sorted alphabetically, emoji are ignored
      (ent1, ent2) =>
        ent1.decr.protected
          ? -1
          : stripEmoji(ent1.decr.name).localeCompare(stripEmoji(ent2.decr.name)),
    ),
    $state =>
      $state.reduce(
        (acc, curr) => {
          // Only allow one protected search. Made mostly for joint wallets
          if (curr.decr.protected && acc.protected) return acc;

          acc.protected = true;
          acc.res.push(curr);
          return acc;
        },
        { protected: false, res: [] as typeof $state },
      ).res,
  ),
  defaultSearchFilter = derived(
    currentWalletSearchFilterStore,
    state => getDefaultSearchFromWalletState(state)!,
  );
