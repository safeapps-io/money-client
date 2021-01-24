import { createDecrEntityStore } from './base';
import { EntityTypes, Asset } from './types';
import { derived } from 'svelte/store';

export const {
  store: assetStore,
  currentWalletStore: currentWalletAssetStore,
  add: assetAdd,
  overwrite: assetOverwrite,
  update: assetUpdate,
  deletedDataConsistencyGuardStore: assetDeleteGuard,
} = createDecrEntityStore<Asset>(EntityTypes.asset);

export const defaultAssetStore = derived(
  currentWalletAssetStore,
  $assets => Object.values($assets)[0],
);
