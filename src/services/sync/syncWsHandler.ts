import { EncrEntity } from '@/stores/encr/store';
import { syncStatusStore, SyncStatuses } from '@/stores/sync';
import { bulkSetEncrEntities } from '@/stores/encr/operations';

const enum BackTypes {
  backData = 'sync/data',
  finished = 'sync/finished',
}
export type SyncBackMessage =
  | { type: BackTypes.backData; data: EncrEntity[] }
  | { type: BackTypes.finished };

export const syncMessagesPrefix = 'sync',
  syncHandleMessages = (message: SyncBackMessage) => {
    switch (message.type) {
      case BackTypes.backData: {
        if (message.data) bulkSetEncrEntities(message.data);
        break;
      }

      case BackTypes.finished: {
        syncStatusStore.set(SyncStatuses.finished);
        break;
      }
    }
  };
