import { derived } from 'svelte/store';

import type { FullEntity, ReferenceTransaction, Transaction, CorrectionTransaction } from './types';
import { transactionSortedByDatetimeStore } from './transaction';
import { currentWalletReferenceTransactionStore } from './referenceTransaction';
import { currentWalletCorrectionTransactionStore } from './correctionTransaction';

/**
 * A composite derived store, that holds all the transactions, that have influence over balance.
 */
type AllFullEntityTransactions = FullEntity<
  Transaction | ReferenceTransaction | CorrectionTransaction
>;
export const balanceInfluencingTransactionsStore = derived(
  [
    transactionSortedByDatetimeStore,
    currentWalletReferenceTransactionStore,
    currentWalletCorrectionTransactionStore,
  ],
  ([$trs, $ref, $corr]) =>
    ([] as Array<AllFullEntityTransactions>)
      .concat($trs, Object.values($ref), Object.values($corr))
      .sort((tr1, tr2) => {
        if (tr1.decr.datetime > tr2.decr.datetime) return 1;
        if (tr1.decr.datetime < tr2.decr.datetime) return -1;

        if (tr1.decr.created > tr2.decr.created) return 1;
        if (tr1.decr.created < tr2.decr.created) return -1;

        return 0;
      }),
);
