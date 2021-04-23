import { isAfter, isBefore } from 'date-fns/esm';

import type { InteratorPluginConstructor } from './types';
import type { FullEntity, Transaction, CorrectionTransaction } from '$stores/decr/types';
import { EntityTypes } from '$stores/decr/types';

type ReturningEnt = FullEntity<Transaction | CorrectionTransaction>;
export type DisplayTransactionReturn = ReturningEnt[];

export const displayTransactionsPlugin: InteratorPluginConstructor<ReturningEnt[]> = (
  startDate,
  endDate,
) => {
  const result: ReturningEnt[] = [];

  return {
    transactionHandler: tr => {
      if (
        tr.decr.type !== EntityTypes.referenceTransaction &&
        isAfter(tr.decr.datetime, startDate) &&
        isBefore(tr.decr.datetime, endDate)
      )
        result.push(tr as ReturningEnt);
    },
    getResult: () => result.reverse(),
  };
};
