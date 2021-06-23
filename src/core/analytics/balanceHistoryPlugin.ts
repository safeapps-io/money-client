import {
  startOfDay,
  endOfDay,
  isBefore,
  isAfter,
  differenceInDays,
  addDays,
  minTime,
} from 'date-fns/esm';

import type { IteratorPlugin } from './types';
import { EntityTypes } from '$stores/decr/types';

export const balanceHistoryPlugin = (
  periodStart: number,
  periodEnd: number,
  activeRefTransactionId?: string,
): IteratorPlugin<BalanceHistoryReturn> => {
  // Holds the balance history since the very beginning
  const fullHistory: TransactionHistory = [];

  return {
    transactionHandler: tr => {
      const balanceRecordDate = startOfDay(tr.decr.datetime),
        { amount } = tr.decr;

      /*
       * We're looking for the latest record of balance fullHistory.
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
          value: latestRecord?.value || 0,
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
    getResult: () => {
      let balance: number | undefined, balanceComparison: number | undefined;

      for (let i = fullHistory.length - 1; i >= 0; i--) {
        const balanceRecord = fullHistory[i];

        // We go back in time until we find a record, which date equals the period end
        if (typeof balance === 'undefined' && isBefore(balanceRecord.date, periodEnd))
          balance = balanceRecord.value;

        // We go back in time until we find a record, which date equals the period start; after that we break the cycle
        if (typeof balanceComparison === 'undefined' && isBefore(balanceRecord.date, periodStart)) {
          balanceComparison = balanceRecord.value;
          break;
        }
      }

      /**
       * Filling in the blanks so the fullHistory is a daily record.
       *
       * periodStart/end can essentially have 2 states: _real_ period (like, a month) or min/maxTime.
       * If it is min/maxTime, we want to show a chart from the earliest date to the latest in fullHistory.
       * If it is a real period, we want to show a chart for this period, but periodEnd shouldn't
       * be higher than now.
       */
      let minDate: Date | number, maxDate: Date | number;
      if (periodStart == minTime) {
        minDate = fullHistory[0].date;
        maxDate = fullHistory[fullHistory.length - 1].date;
      } else {
        minDate = periodStart;
        const now = endOfDay(new Date());
        maxDate = isAfter(periodEnd, now) ? now : periodEnd;
      }

      let prevValue: number, currIndex: number;
      // We need to find starting item for the balance. It's the one right before minDate.
      for (let i = 0; i < fullHistory.length; i++) {
        const curr = fullHistory[i];

        // Once we go after minDate, we break, because we've found the prevValue for the chart.
        if (isAfter(curr.date, minDate)) break;

        prevValue = curr.value;
        currIndex = i;
      }

      const resultHistory: TransactionHistory = [];
      for (let i = 0; i <= differenceInDays(maxDate, minDate); i++) {
        const currDate = addDays(minDate, i),
          currentDataPoint = fullHistory[currIndex!];

        // console.log(JSON.stringify({ i, currentDataPoint, currDate }, null, 2));

        if (!currentDataPoint || isAfter(currentDataPoint.date, currDate))
          resultHistory.push({ date: currDate, value: prevValue! });
        else {
          const value = currentDataPoint.value;
          resultHistory.push({ date: currDate, value });
          prevValue = value;
          currIndex!++;
        }
      }

      return {
        balance,
        balanceComparison: balanceComparison,
        history: resultHistory,
      };
    },
  };
};

type TransactionHistory = { date: Date; value: number }[];

export type BalanceHistoryReturn = {
  balance: number | undefined;
  balanceComparison: number | undefined;
  history: TransactionHistory;
};
