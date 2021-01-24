import { createDecrEntityStore } from './base';
import { CorrectionTransaction, EntityTypes } from './types';

export const {
  store: correctionTransactionStore,
  currentWalletStore: currentWalletCorrectionTransactionStore,
  add: correctionTransactionAdd,
  overwrite: correctionTransactionOverwrite,
  update: correctionTransactionUpdate,
  deletedDataConsistencyGuardStore: correctionTransactionDeleteGuard,
} = createDecrEntityStore<CorrectionTransaction>(EntityTypes.correctionTransaction);
