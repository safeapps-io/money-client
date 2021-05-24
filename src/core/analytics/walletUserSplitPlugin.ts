import type { InteratorPluginConstructor } from './types';
import { EntityTypes } from '$stores/decr/types';
import { copy } from '$utils/object';

type IdStat = { [id: string]: number };
type SortedIdStat = { id: string; value: number }[];

type PeriodResult = { income: SortedIdStat; expense: SortedIdStat };

export type WalletUserSplitReturn = {
  prev: PeriodResult;
  curr: PeriodResult;
};

const periodStat: { income: IdStat; expense: IdStat } = { income: {}, expense: {} };

export const walletUserSplitPlugin: InteratorPluginConstructor<WalletUserSplitReturn> = (
  startDate,
  endDate,
  prevStartDate,
) => {
  let result = { prev: copy(periodStat), curr: copy(periodStat) };
  return {
    transactionHandler: tr => {
      // We ignore all balance transactions here
      if (tr.decr.type !== EntityTypes.transaction) return;

      const { datetime, amount, walletUserId } = tr.decr;
      let mainKey: keyof typeof result | null = null,
        innerKey: keyof typeof periodStat = amount > 0 ? 'income' : 'expense';
      if (prevStartDate && datetime >= prevStartDate && datetime < startDate) mainKey = 'prev';
      else if (datetime >= startDate && datetime < endDate) mainKey = 'curr';

      if (!mainKey) return;

      if (typeof result[mainKey][innerKey][walletUserId] == 'undefined')
        result[mainKey][innerKey][walletUserId] = 0;
      result[mainKey][innerKey][walletUserId] += amount;
    },
    getResult: () => ({
      prev: transformPeriodResult(result.prev),
      curr: transformPeriodResult(result.curr),
    }),
  };
};

function transformPeriodResult(data: { income: IdStat; expense: IdStat }): PeriodResult {
  return { income: transformOneResult(data.income), expense: transformOneResult(data.expense) };
}

function transformOneResult(data: IdStat): SortedIdStat {
  return Object.entries(data)
    .map(([id, value]) => ({ id, value: Math.abs(value) }))
    .sort((a, b) => b.value - a.value);
}
