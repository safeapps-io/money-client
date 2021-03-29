import type { InteratorPluginConstructor } from './types';
import { EntityTypes } from '$stores/decr/types';

export type IncomeAndExpenseReturn = {
  income: number;
  expense: number;
  prevExpense?: number;
  prevIncome?: number;
};

const enum StatKeys {
  income = 'income',
  expense = 'expense',
  prevIncome = 'prevIncome',
  prevExpense = 'prevExpense',
}

export const incomeAndExpensePlugin: InteratorPluginConstructor<IncomeAndExpenseReturn> = (
  startDate,
  endDate,
  prevStartDate,
) => {
  const res: {
    [StatKeys.income]: number;
    [StatKeys.expense]: number;
    [StatKeys.prevIncome]?: number;
    [StatKeys.prevExpense]?: number;
  } = { [StatKeys.income]: 0, [StatKeys.expense]: 0 };

  return {
    transactionHandler: tr => {
      const { type, amount, datetime } = tr.decr;
      if (type !== EntityTypes.transaction) return;

      let key: StatKeys | undefined = undefined;
      if (prevStartDate && datetime >= prevStartDate && datetime < startDate) {
        // Prev period
        // Initializing prev stats. They are optional, because not all periods have past
        res[StatKeys.prevExpense] = res[StatKeys.prevExpense] ?? 0;
        res[StatKeys.prevIncome] = res[StatKeys.prevIncome] ?? 0;
        key = amount >= 0 ? StatKeys.prevIncome : StatKeys.prevExpense;
      } else if (datetime >= startDate && datetime < endDate)
        // Curr period
        key = amount >= 0 ? StatKeys.income : StatKeys.expense;

      if (key) res[key] += amount;
    },
    getResult: () => {
      const r = {
          ...res,
          [StatKeys.expense]: Math.abs(res[StatKeys.expense]),
        },
        prevE = res[StatKeys.prevExpense];
      if (prevE) r[StatKeys.prevExpense] = Math.abs(prevE);
      return r;
    },
  };
};
