import { derived } from 'svelte/store';

import { createDecrEntityStore } from './base';
import type { WalletData, FullEntity } from './types';
import { EntityTypes } from './types';

const {
  store: _walletDataStore,
  add: walletDataAdd,
  currentWalletStore,
  overwrite: walletDataOverwrite,
  update: walletDataUpdate,
  reset: walletDataReset,
  deletedDataConsistencyGuardStore: walletDataDeleteGuard,
} = createDecrEntityStore<WalletData>(EntityTypes.walletData, (ent, deletedEntityIds) =>
  ent.decr.activeTransactionId && deletedEntityIds.includes(ent.decr.activeTransactionId)
    ? ((ent.decr.activeTransactionId = undefined), ent)
    : null,
);

const currentWalletDataStore = derived(currentWalletStore, $state => Object.values($state)[0]),
  walletDataStore = derived(_walletDataStore, $state =>
    Object.fromEntries(
      Object.values($state)
        .flatMap(walletBasedEntities => Object.values(walletBasedEntities))
        .map(item => [item.id, item]),
    ),
  );

export {
  walletDataDeleteGuard,
  walletDataStore,
  currentWalletDataStore,
  walletDataAdd,
  walletDataOverwrite,
  walletDataUpdate,
  walletDataReset,
};
