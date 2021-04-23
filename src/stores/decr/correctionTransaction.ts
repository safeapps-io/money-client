import { createDecrEntityStore } from './base';
import type { CorrectionTransaction } from './types';
import { EntityTypes } from './types';

export const {
  store: correctionTransactionStore,
  currentWalletStore: currentWalletCorrectionTransactionStore,
  add: correctionTransactionAdd,
  overwrite: correctionTransactionOverwrite,
  update: correctionTransactionUpdate,
  deletedDataConsistencyGuardStore: correctionTransactionDeleteGuard,
} = createDecrEntityStore<CorrectionTransaction>(EntityTypes.correctionTransaction);
