import type { InitialTransactionState, ParsedTransaction } from './types';
import type { OccurenciesSortedByPopularity } from '$stores/decr/autocomplete';

export const getInitialTransactionState = ({
  parsedTransaction,
  defaultData,
  autocompleteData,
  walletUserCount,
}: {
  parsedTransaction: ParsedTransaction;
  defaultData: { assetId: string; userId: string; walletUserId: string };
  walletUserCount: number;
  autocompleteData: {
    mcc: OccurenciesSortedByPopularity;
    accountNumber: OccurenciesSortedByPopularity;
    merchant: OccurenciesSortedByPopularity;
    categoryByPopularity: string[];
  };
}) => {
  const { accountNumber, mcc, merchant } = parsedTransaction.autocomplete,
    finalTransaction = {
      ...parsedTransaction,
      ...defaultData,
      isDraft: false,
    } as InitialTransactionState;

  /**
   * We try to get the first user from the autocomplete history and offer other history as option for sorting.
   *
   * Another case would be when we only have a single wallet user in the wallet. Most probably by the time a user
   * reaches 30 to 60 transactions they probably have already created all walletusers they need, so it's a safe
   * bet, that user can be set automatically.
   */
  const possibleWalletUserId =
    accountNumber && autocompleteData.accountNumber?.[accountNumber]?.[0];

  if (possibleWalletUserId) finalTransaction.walletUserId = possibleWalletUserId;
  else if (walletUserCount == 1) finalTransaction.walletUserId = defaultData.walletUserId;

  /**
   * We first try to set the category from merchant name and then by mcc code.
   */
  let suggestedCategoryIds: string[] | undefined = undefined;
  if (merchant && autocompleteData.merchant[merchant])
    suggestedCategoryIds = autocompleteData.merchant[merchant];
  else if (mcc && autocompleteData.mcc[mcc]) suggestedCategoryIds = autocompleteData.mcc[mcc];
  finalTransaction.categoryId = suggestedCategoryIds?.[0];

  if (finalTransaction.amount == finalTransaction.originalAmount) {
    delete finalTransaction.originalAmount;
    delete finalTransaction.currency;
  }

  return { transaction: finalTransaction, suggestedCategoryIds };
};
