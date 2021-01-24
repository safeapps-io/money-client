import { derived } from 'svelte/store';
import { firstBy } from 'thenby';

import { FullEntity, ReferenceTransaction, Transaction, CorrectionTransaction } from './types';
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
      .sort(
        firstBy(
          (tr1, tr2) =>
            (tr1 as AllFullEntityTransactions).decr.datetime -
            (tr2 as AllFullEntityTransactions).decr.datetime,
        ).thenBy(
          (tr1, tr2) =>
            (tr1 as AllFullEntityTransactions).decr.created -
            (tr2 as AllFullEntityTransactions).decr.created,
        ),
      ),
);
