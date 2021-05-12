import { createDecrEntityStore } from './base';
import type { ReferenceTransaction } from './types';
import { EntityTypes } from './types';

export const {
  store: referenceTransactionStore,
  currentWalletStore: currentWalletReferenceTransactionStore,
  add: referenceTransactionAdd,
  overwrite: referenceTransactionOverwrite,
  update: referenceTransactionUpdate,
  reset: referenceTransactionReset,
  bulkUpdate: referenceTransactionBulkUpdate,
  deletedDataConsistencyGuardStore: referenceTransactionDeleteGuard,
} = createDecrEntityStore<ReferenceTransaction>(EntityTypes.referenceTransaction);
