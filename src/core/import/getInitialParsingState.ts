import type { autocompleteDataStore } from '$stores/decr/autocomplete';
import type { OmitCommonFields, Transaction } from '$stores/decr/types';
import { shouldAutoResolveAll, shouldTransactionBeAutoResolved } from './autoResolve';
import { getInitialTransactionState } from './getInitialTransactionState';
import { getTransposedAutocomplete } from './selfUpdatingAutocomplete';
import type { AutomationSettings, ParsedTransaction } from './types';

export const getInitialParsingState = ({
  rawParsedTransactions,
  autocompleteData,

  defaultData,
  settings,
  transactionCount,
  walletUserCount,
  getFallbackByMcc,
}: {
  rawParsedTransactions: ParsedTransaction[];
  autocompleteData: StoreValue<typeof autocompleteDataStore>;

  defaultData: { userId: string; assetId: string; walletUserId: string };
  settings: AutomationSettings;
  transactionCount: number;
  walletUserCount: number;
  getFallbackByMcc: (mcc: string) => string[];
}) => {
  const shouldRunAutoResolveAgainstAll = shouldAutoResolveAll({ settings, transactionCount }),
    toResolveAuto: OmitCommonFields<Transaction>[] = [],
    toResolveManually: ParsedTransaction[] = [];

  const transposedAutocomplete = getTransposedAutocomplete(autocompleteData);

  if (shouldRunAutoResolveAgainstAll) {
    for (const transactionToDecide of rawParsedTransactions) {
      const initialTransactionState = getInitialTransactionState({
        parsedTransaction: transactionToDecide,
        autocompleteData: transposedAutocomplete,
        defaultData,
        walletUserCount,
        getFallbackByMcc,
      }).transaction;
      if (
        shouldTransactionBeAutoResolved({
          transaction: initialTransactionState,
          autocompleteData,
          settings,
        })
      )
        toResolveAuto.push(initialTransactionState as OmitCommonFields<Transaction>);
      else toResolveManually.push(transactionToDecide);
    }
  }

  return {
    toResolveAuto,
    toResolveManually: shouldRunAutoResolveAgainstAll ? toResolveManually : rawParsedTransactions,
  };
};
