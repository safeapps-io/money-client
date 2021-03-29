import type {
  Transaction,
  FullEntity,
  ReferenceTransaction,
  CorrectionTransaction,
} from '$stores/decr/types';
import type { IteratorPlugin } from './types';

export const transactionIterator = (
  transactions: FullEntity<Transaction | ReferenceTransaction | CorrectionTransaction>[],
  filterFn: (tr: FullEntity<Transaction | ReferenceTransaction | CorrectionTransaction>) => boolean,
  plugins: IteratorPlugin<any>[],
) => {
  for (let tr of transactions) {
    if (filterFn(tr)) plugins.forEach(plugin => plugin.transactionHandler(tr));
  }

  return plugins.map(plugin => plugin.getResult());
};
