import { writable, derived } from 'svelte/store';

import { createDecrEntityStore } from './base';
import type { WalletUser } from './types';
import { EntityTypes } from './types';

export const {
    store: walletUserStore,
    currentWalletStore: currentWalletUserStore,
    add: walletUserAdd,
    overwrite: walletUserOverwrite,
    update: walletUserUpdate,
  } = createDecrEntityStore<WalletUser>(EntityTypes.walletUser),
  walletUserSortedByCreatedStore = derived(currentWalletUserStore, $wu =>
    Object.values($wu).sort((wu1, wu2) => wu1.decr.created - wu2.decr.created),
  );

/**
 * Cached data on what was the last user chosen during manual transaction creation
 */
export const lastWalletUserChosenCacheKey = 'lastUserChosen',
  lastWalletUserChosenStore = writable<string | null>(null),
  setLastWalletUserChosen = (val: string) => lastWalletUserChosenStore.set(val);

export const defaultWalletUserIdStore = derived(
  [lastWalletUserChosenStore, currentWalletUserStore],
  ([$last, $all]) => $last || Object.values($all)[0].id,
);
