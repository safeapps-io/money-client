import {
  Transaction,
  FullEntity,
  CorrectionTransaction,
  ReferenceTransaction,
} from '@/stores/decr/types';

export type IteratorPlugin<T> = {
  transactionHandler: (
    tr: FullEntity<Transaction | CorrectionTransaction | ReferenceTransaction>,
  ) => void;
  getResult: () => T;
};
export type InteratorPluginConstructor<T> = (
  startDate: number,
  endDate: number,
  prevStartDate?: number,
) => IteratorPlugin<T>;
