import { startOfDay, isBefore, isAfter, differenceInDays, addDays, minTime } from 'date-fns/esm';

import type { IteratorPlugin } from './types';
import { EntityTypes } from '$stores/decr/types';

/**
 * This high-order function holds the context for dates and full transaction history.
 * It is actually `calculateBalance` function, that returns the filtered period as well
 * all the delta.
 */
export const balanceHistoryPlugin = (
  periodStart: number,
  periodEnd: number,
  activeRefTransactionId?: string,
): IteratorPlugin<ReturnType<typeof calculateBalance>> => {
  // Holds the balance history since the very beginning
  const fullHistory: TransactionHistory = [];

  /**
   * We need it to fill blank dates.
   *
   * Implementation detail. `periodStart`/`end` essensially has two possible values:
   * 1. minTime/maxTime if it's all time period
   * 2. real start/end of some calendar entity (month, year, etc.)
   *
   * So if periodStart == minTime, then we need to find the first and the last transaction
   * ever and use it as the real min/maxDate; if not, we use the provided values as is.
   */
  const shouldSearchForPeriodStart = periodStart == minTime,
    maxDate = isAfter(periodEnd, new Date()) ? addDays(new Date(), 1).getTime() : periodEnd;
  let minDate = shouldSearchForPeriodStart ? periodEnd : periodStart;

  return {
    transactionHandler: tr => {
      const balanceRecordDate = startOfDay(tr.decr.datetime),
        { amount } = tr.decr;

      if (shouldSearchForPeriodStart && isBefore(balanceRecordDate, minDate))
        minDate = balanceRecordDate.getTime();

      /*
       * We're looking for the latest record of balance history.
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
    getResult: () => calculateBalance(fullHistory, { periodStart, periodEnd, minDate, maxDate }),
  };
};

function calculateBalance(
  history: TransactionHistory,
  {
    periodStart,
    periodEnd,
    minDate,
    maxDate,
  }: { periodStart: number; periodEnd: number; minDate: number; maxDate: number },
) {
  let balance: number | undefined, balanceComparison: number | undefined;

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

  // Filling in the blanks so the history is a daily record
  const resultHistory: TransactionHistory = [];
  let currIndex = 0,
    prevValue = history[0].value;

  for (let i = 0; i < differenceInDays(maxDate, minDate); i++) {
    const currDate = addDays(minDate, i),
      currentDataPoint = history[currIndex];

    // Omitting the data that does not fit in the period
    if (isAfter(currDate, periodEnd) && isBefore(currDate, periodStart)) continue;

    if (!currentDataPoint || isAfter(currentDataPoint.date, currDate))
      resultHistory.push({ date: currDate, value: prevValue });
    else {
      const value = currentDataPoint.value;
      resultHistory.push({ date: currDate, value });
      prevValue = value;
      currIndex++;
    }
  }

  return {
    balance,
    balanceComparison: balanceComparison,
    history: resultHistory,
  };
}

type TransactionHistory = { date: Date; value: number }[];

export type BalanceHistoryReturn = ReturnType<typeof calculateBalance>;
