import { autocompleteDataStore } from '@/stores/decr/autocomplete';
import { OmitCommonFields, Transaction } from '@/stores/decr/types';
import { shouldAutoResolveAll, shouldTransactionBeAutoResolved } from './autoResolve';
import { getInitialTransactionState } from './getInitialTransactionState';
import { getTransposedAutocomplete } from './selfUpdatingAutocomplete';
import { AutomationSettings, ParsedTransaction } from './types';

export const getInitialParsingState = ({
  rawParsedTransactions,
  autocompleteData,

  defaultData,
  settings,
  transactionCount,
}: {
  rawParsedTransactions: ParsedTransaction[];
  autocompleteData: StoreValue<typeof autocompleteDataStore>;

  defaultData: { userId: string; assetId: string };
  settings: AutomationSettings;
  transactionCount: number;
}) => {
  const shouldRunAutoResolveAgainstAll = shouldAutoResolveAll({ settings, transactionCount }),
    toResolveAuto: OmitCommonFields<Transaction>[] = [],
    toResolveManually: ParsedTransaction[] = rawParsedTransactions;

  const transposedAutocomplete = getTransposedAutocomplete(autocompleteData);

  if (shouldRunAutoResolveAgainstAll) {
    for (const transactionToDecide of toResolveManually) {
      const initialTransactionState = getInitialTransactionState({
        parsedTransaction: transactionToDecide,
        autocompleteData: transposedAutocomplete,
        defaultData,
      }).transaction;
      if (
        shouldTransactionBeAutoResolved({
          transaction: initialTransactionState,
          autocompleteData,
          settings,
        })
      ) {
        toResolveAuto.push(initialTransactionState as OmitCommonFields<Transaction>);
        toResolveManually.unshift();
      }
    }
  }
  return { toResolveAuto, toResolveManually };
};
