import { startOfDay, isBefore, isAfter } from 'date-fns';

import { IteratorPlugin } from './types';
import { EntityTypes } from '@/stores/decr/types';

type TransactionHistory = { date: Date; value: number }[];

export type BalanceHistoryReturn = ReturnType<typeof calculateBalance>;

const calculateBalance = (history: TransactionHistory, periodStart: number, periodEnd: number) => {
  let balance, balanceComparison;

  for (let i = history.length - 1; i >= 0; i--) {
    const balanceRecord = history[i];

    // We go back in time until we find a record, which date equals the period end
    if (typeof balance === 'undefined' && isBefore(balanceRecord.date, periodEnd))
      balance = balanceRecord.value;

    // We go back in time until we find a record, which date equals the period start; after that we break the cycle
    if (typeof balanceComparison === 'undefined' && isBefore(balanceRecord.date, periodStart)) {
      balanceComparison = balanceRecord.value;
      break;
    }
  }

  return {
    balance,
    balanceComparison: balanceComparison,
    history: history.filter(
      item => isBefore(item.date, periodEnd) && isAfter(item.date, periodStart),
    ),
  };
};

/**
 * This high-order function holds the context for dates and full transaction history.
 * It is actually `calculateBalance` function, that returns all the meaningful stuff.
 */
export const balanceHistoryPlugin = (
  periodStart: number,
  periodEnd: number,
  activeRefTransactionId?: string,
): IteratorPlugin<ReturnType<typeof calculateBalance>> => {
  // Holds the balance history since the very beginning
  const fullHistory: TransactionHistory = [];

  return {
    transactionHandler: tr => {
      const balanceRecordDate = startOfDay(tr.decr.datetime),
        { amount } = tr.decr;

      /*
       * We're looking for the lastest record of balance history.
       *
       * If it doesn't exist, it means it is the first iteration ever.
       * If it exists and its date is the same as current transaction's, then we haven't
       * changed the day yet.
       * If it exists and its date is lower than current transaction's, we've changed the
       * date and need to add a new balance record.
       *
       * We set the date to `balanceRecordDate` and value to latest record's value or 0.
       */
      const latestRecord = fullHistory[fullHistory.length - 1];
      if (typeof latestRecord === 'undefined' || isBefore(latestRecord.date, balanceRecordDate))
        fullHistory.push({
          date: balanceRecordDate,
          value: latestRecord ? latestRecord.value : 0,
        });

      const currentDateRecord = fullHistory[fullHistory.length - 1];

      if (tr.decr.type === EntityTypes.referenceTransaction) {
        if (tr.id != activeRefTransactionId) return;

        /**
         * We calculate the diff between reference value and currently calculated balance.
         * Then we add up this difference to all the previous records.
         *
         * Example:
         * Calc. b.: 100;
         * Ref. b.: 200;
         * 200 - 100 = 100
         * Adding 100 to all the records before.
         */
        const diff = amount - currentDateRecord.value;
        fullHistory.forEach(rec => (rec.value += diff));
        currentDateRecord.value = amount;
        return;
      }

      /**
       * Both correction and usual transaction should just add or subtract its value
       */
      currentDateRecord.value += amount;
    },
    getResult: () => calculateBalance(fullHistory, periodStart, periodEnd),
  };
};
