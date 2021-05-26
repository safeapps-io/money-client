import { derived } from 'svelte/store';

import { EncrEntity, encryptedStore } from '$stores/encr/store';
import { bulkSetEncrEntities } from '$stores/encr/operations';
import { walletStore } from '$stores/wallet';
import type { ClientChangesData } from './types';
import { EntityService } from './entityService';
import { isOnlineStore } from '$stores/isOnline';
import { areArraysTheSame } from '$utils/array';

export const entityEventMap = new Map([
  ['entity/data', (data: EncrEntity[]) => bulkSetEncrEntities(data)],
]);

let alreadyRunAfterGoingOnline = false,
  alreadySentEncrIds: string[] = [],
  syncedWalletIds: string[] = [];
export const syncEntities = derived(
  [isOnlineStore, walletStore, encryptedStore],
  ([$isOnline, $wallet, $encrypted]) => {
    // Wallet hasn't been syncronized just yet. It's user's first sign in.
    if (!$wallet || !$isOnline) {
      alreadyRunAfterGoingOnline = false;
      return;
    }

    const currentWalletIds = Object.keys($wallet);

    // Initial client data object for all local wallets
    const clientData: ClientChangesData = Object.fromEntries(
      currentWalletIds.map(key => [key, { entities: [], latestUpdated: 0 }]),
    );

    // If we have a new wallet, we need to sync it
    let emptySync = areArraysTheSame(currentWalletIds, syncedWalletIds);
    syncedWalletIds = currentWalletIds;

    if ($encrypted)
      for (const ent of Object.values($encrypted)) {
        const walletObj = clientData[ent.walletId];

        if ('updated' in ent && ent.updated > walletObj.latestUpdated)
          walletObj.latestUpdated = ent.updated;
        if (ent.clientUpdated) {
          /**
           * Here's the thing.
           * We have some cases (when a wallet is created, when network is bad),
           * when new entities are created before the old requests are finished.
           *
           * So we end up sending the same entities over the wire once again,
           * even though backend has already saved them. It results in error 500.
           *
           * That's why we save the newly created entity ids and do not resend them.
           *
           * It can be better, we could debounce the requests, but meh.
           */
          if (alreadySentEncrIds.includes(ent.id)) continue;

          emptySync = false;
          walletObj.entities.push(ent);
          alreadySentEncrIds.push(ent.id);
        }
      }

    /**
     * We always send out this object if there's a `clientUpdated` entity.
     * We also resend the request if it is the first time we got online after being offline.
     */
    if (!emptySync || !alreadyRunAfterGoingOnline) {
      alreadyRunAfterGoingOnline = true;
      EntityService.uploadEntities(clientData)
        .then(res => {
          const savedIds = res.map(ent => ent.id);
          alreadySentEncrIds = alreadySentEncrIds.filter(id => !savedIds.includes(id));
        })
        .catch(e => console.error('sync upload error', e));
    }
  },
);
