import { locale } from 'svelte-i18n';
import type { Writable } from 'svelte/store';
import { derived } from 'svelte/store';
import { noop } from 'svelte/internal';

import { persistStore } from '$utils/persistStore';

import { keyWrappedWithPinStore, userCacheKey, userEncrStore } from './user';
import {
  walletCacheKey,
  selectedWalletStore,
  selectedWalletCacheKey,
  walletStore,
  selectedJointWalletCacheKey,
  selectedJointWalletStore,
} from './wallet';
import { encryptedCacheKey, encryptedStore } from './encr/store';
import { mccCacheKey, mccStore } from './mcc';
import { lastWalletUserChosenCacheKey, lastWalletUserChosenStore } from './decr/walletUser';
import { schemeCacheKey, schemeStore } from './scheme';
import { metaCategoryCacheKey, metaCategoryStore } from './metaCategory';
import {
  decrDataCleaner,
  encrDataCleaner,
  walletEncryptedDataCleaner,
} from '$services/entity/dataCleaners';
import { walletKeysSetter } from '$services/crypto/setWalletKeys';
import { initialDecryption } from '$services/crypto/setDecryptedData';
import { removeRequestHandler } from '$services/entity/remoteDeleteData';
import { syncUser } from '$services/auth/userEvents';
import { updateMetaCategories, updateSchemes } from '$services/directory/directoryService';
import { syncEntities } from '$services/entity/entityEvents';
import { sseEndpointsStore } from '$services/sse';

// Use it in top app layout component, wait for initialization, block the app from running
// until it works
const storesToPersist: [string, Writable<any>][] = [
  ['locale', locale],
  ['pin', keyWrappedWithPinStore],
  [userCacheKey, userEncrStore],
  [mccCacheKey, mccStore],
  [schemeCacheKey, schemeStore],
  [metaCategoryCacheKey, metaCategoryStore],
  [walletCacheKey, walletStore],
  [selectedWalletCacheKey, selectedWalletStore],
  [selectedJointWalletCacheKey, selectedJointWalletStore],
  [encryptedCacheKey, encryptedStore],
  [lastWalletUserChosenCacheKey, lastWalletUserChosenStore],
];

export const initStores = () =>
  Promise.all(storesToPersist.map(([key, store]) => persistStore(key, store)));

/**
 * First should go all the stores, that provide data consistency.
 * E.g., the cleaner, that removes all the data of deleted wallets.
 */
export const initApplicationLogic = derived(
  [
    // Cleaners
    walletEncryptedDataCleaner,
    decrDataCleaner,
    encrDataCleaner,

    // Syncers
    sseEndpointsStore,
    syncEntities,
    syncUser,
    updateSchemes,
    updateMetaCategories,

    // Decryption
    walletKeysSetter,
    initialDecryption,

    // Data removal
    removeRequestHandler,
  ],
  noop,
);
