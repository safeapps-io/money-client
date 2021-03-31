import { derived } from 'svelte/store';

import { areArraysTheSame } from '$utils/array';

import { encryptionKeysStateStore, walletKeysSet } from '$stores/encr/keysState';
import { currentChestsStore } from '$stores/wallet';

import { encryptionService } from './cryptoService';

/**
 * Store that sets wallet encryption keys on encryptionService every time wallets
 * change.
 */
let lastKeySet = [] as string[];
export const walletKeysSetter = derived(
  [encryptionKeysStateStore, currentChestsStore],
  async ([$encryptionStates, $chests]) => {
    if ($encryptionStates.walletKeysSet || !$encryptionStates.encryptionKeySet) return;

    const walletIds = $chests.map(({ walletId }) => walletId);
    if (areArraysTheSame(walletIds, lastKeySet)) return;

    lastKeySet = walletIds;

    await Promise.all(
      $chests.map(({ chest, walletId }) =>
        encryptionService.getSecretKeyFromChest(chest, walletId),
      ),
    );
    walletKeysSet(true);
  },
);
