import type { InteratorPluginConstructor } from './types';
import { EntityTypes } from '$stores/decr/types';

type StatsObj = { [categoryId: string]: number };

const transformResult = (obj: StatsObj) =>
  Object.entries(obj)
    .filter(([_, value]) => value != 0)
    .map(([id, value]) => ({ id, value: Math.abs(value) }))
    .sort((a, b) => b.value - a.value);

export type CategorySplitReturn = {
  prev: ReturnType<typeof transformResult>;
  curr: ReturnType<typeof transformResult>;
};

export enum NoCategoryObjectKey {
  income = 'i',
  expense = 'e',
}

export const categorySplitPlugin: InteratorPluginConstructor<CategorySplitReturn> = (
  startDate,
  endDate,
  prevStartDate,
) => {
  const result: {
    prev: StatsObj;
    curr: StatsObj;
  } = {
    prev: {},
    curr: {},
  };

  return {
    transactionHandler: tr => {
      // We ignore all balance transactions here
      if (tr.decr.type !== EntityTypes.transaction) return;

      const { datetime, amount } = tr.decr;

      let categoryId: string;
      if (tr.decr.categoryId) categoryId = tr.decr.categoryId;
      // We need to separate the "no category" category to make the stats right. Expense and income
      // has their own "no category" here.
      else categoryId = amount >= 0 ? NoCategoryObjectKey.income : NoCategoryObjectKey.expense;

      if (prevStartDate && datetime >= prevStartDate && datetime < startDate) {
        if (!result.prev[categoryId]) result.prev[categoryId] = 0;
        result.prev[categoryId] += amount;
      } else if (datetime >= startDate && datetime < endDate) {
        if (!result.curr[categoryId]) result.curr[categoryId] = 0;
        result.curr[categoryId] += amount;
      }
    },
    getResult: () => ({
      prev: transformResult(result.prev),
      curr: transformResult(result.curr),
    }),
  };
};
