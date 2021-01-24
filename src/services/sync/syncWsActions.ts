import { derived } from 'svelte/store';

import { areArraysTheSame } from '@/utils/array';

import { syncConnection } from './syncConnection';
import { walletStore } from '@/stores/wallet';
import { encryptedStore, EncrEntity, EncrEntityLocal } from '@/stores/encr/store';
import { syncStatusStore, SyncStatuses } from '@/stores/sync';

type ClientChangesData = {
  [walletId: string]: {
    entities: Array<EncrEntity | EncrEntityLocal>;
    latestUpdated: number;
  };
};

const enum ClientTypes {
  clientData = 'sync/data',
}

let lastSyncWalletId: string[] = [];
export const syncData = derived(
  [syncConnection, syncStatusStore, walletStore, encryptedStore],
  ([$sync, $syncStatus, $wallet, $encrypted]) => {
    if (!$sync || !$wallet) {
      // Very viable for user switch or socket closing logic. We reset the value to
      // eliminate the possibility of stale caches
      return syncStatusStore.set(SyncStatuses.initial);
    }

    // We never send clientChanges if the sync has already started, because it launches
    // an almost infinite loop
    if ($syncStatus === SyncStatuses.runs) return;

    const currentWalletIds = Object.keys($wallet);
    /**
     * The sync is never empty if the composition of local wallets has changed.
     * Most probably it means that we've joined another wallet and do not have
     * any data from it.
     */
    let emptySync = areArraysTheSame(currentWalletIds, lastSyncWalletId);
    lastSyncWalletId = currentWalletIds;

    const clientData = currentWalletIds.reduce((acc, curr) => {
      acc[curr] = { entities: [], latestUpdated: 0 };
      return acc;
    }, {} as ClientChangesData);

    if ($encrypted)
      for (const ent of Object.values($encrypted)) {
        const s = clientData[ent.walletId];

        if ('updated' in ent && ent.updated > s.latestUpdated) s.latestUpdated = ent.updated;
        if (ent.clientUpdated) {
          s.entities.push(ent);
          emptySync = false;
        }
      }

    /**
     * The sync has already been on for a while. This is some kind of a local data change,
     * that shouldn't be reflected on backend.
     * E.g. this condition would fire when token is changed (therefore syncConnection would
     * change as well).
     *
     * Also, if something is sent from backend to client, it would not have `clientUpdated`,
     * therefore sync would be "empty".
     */
    if ($syncStatus === SyncStatuses.finished && emptySync) return;

    // The transition can be initial -> runs or finished -> runs.
    syncStatusStore.set(SyncStatuses.runs);
    $sync.sendMessage({ type: ClientTypes.clientData, data: clientData });
  },
);
