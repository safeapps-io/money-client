import { derived } from 'svelte/store';

import { eventSourceStoreConstructor } from '$utils/eventSourceStore';

import { EncrEntity, encryptedStore } from '$stores/encr/store';
import { apiPath } from '$services/config';
import { bulkSetEncrEntities } from '$stores/encr/operations';
import { walletStore } from '$stores/wallet';
import type { ClientChangesData } from './types';
import { EntityService } from './entityService';

type SyncDataEvent = { type: 'data'; data: EncrEntity[] };

export const entityEvents = eventSourceStoreConstructor({
  path: `${apiPath}/entity/updates`,
  handler: (message: SyncDataEvent) => bulkSetEncrEntities(message.data),
});

let prevClientId: string | null = null,
  alreadySentEncrIds: string[] = [];
export const syncEntities = derived(
  [entityEvents, walletStore, encryptedStore],
  ([$clientId, $wallet, $encrypted]) => {
    // Wallet hasn't been syncronized just yet. It's user's first sign in.
    if (!$wallet) return;

    // Initial client data object for all local wallets
    const clientData = Object.keys($wallet).reduce<ClientChangesData>((acc, curr) => {
      acc[curr] = { entities: [], latestUpdated: 0 };
      return acc;
    }, {});

    let emptySync = true;
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
     * If not we only send it out once per established `clientId`.
     */
    if (!emptySync || prevClientId != $clientId) {
      prevClientId = $clientId;

      EntityService.uploadEntities($clientId || '', clientData)
        .then(res => {
          const savedIds = res.map(ent => ent.id);
          alreadySentEncrIds = alreadySentEncrIds.filter(id => !savedIds.includes(id));
        })
        .catch(e => console.error('sync upload error', e));
    }
  },
);
