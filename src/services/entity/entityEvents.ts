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

let prevClientId: string | null = null;
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
          emptySync = false;
          walletObj.entities.push(ent);
        }
      }

    /**
     * We always send out this object if there's a `clientUpdated` entity.
     * If not we only send it out once per established `clientId`.
     */
    if (!emptySync || prevClientId != $clientId) {
      prevClientId = $clientId;

      EntityService.uploadEntities($clientId || '', clientData).catch(e =>
        console.error('sync upload error', e),
      );
    }
  },
);
