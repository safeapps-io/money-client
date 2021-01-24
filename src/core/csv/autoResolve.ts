import { autocompleteDataStore, OccurenciesValue } from '@/stores/decr/autocomplete';
import { AutomationSettings, InitialTransactionState } from './types';

// Auto-resolve settings //
const transactionCountToResolveAllMin = 30,
  transactionCountToResolveAllMax = 50;

const transactionCountToResolveSingleMin = 2,
  transactionCountToResolveSingleMax = 10;

const thisResultThresholdPercentMin = 0.75,
  thisResultThresholdPercentMax = 0.95;
///////////////////////////

const countCurrentValueAccordingToSettings = (min: number, max: number, power: number) =>
  max - power * max + min;

/**
 * May be hard to grasp, but bear with me.
 * This function tells us if this transaction is compliant with current auto-resolve settings.
 *
 * Auto-resolve documentation, kind of: https://www.notion.so/dkzlv/CSV-856eaaa6477042beae00a957585d60b0
 *
 * Here are the params documentation. Imagine, we got a ParsedTransaction with MCC code, that
 * we attributed to the a certain category. So here's the idea:
 *
 * @param transactionAutocompleteValue The MCC code itself.
 * @param transactionCompletedValue The assigned `categoryId`.
 * @param autocompleteDataAttrSlice `autocompleteDataStore.mcc`
 * @param countSetting Minimum amount of transactions that were attributed to this
 * `categoryId` with this MCC code in the past.
 * @param percentSetting Minimum percent of transactions that were attributed to this
 * `categoryId` with this MCC code in the past in comparison to all other categories.
 */
const checkTransactionAutocompleteAttrAgainstAutocompleteData = (
  transactionAutocompleteValue: string | undefined,
  transactionCompletedValue: string,
  autocompleteDataAttrSlice: OccurenciesValue,
  countSetting: number,
  percentSetting: number,
): boolean => {
  if (!transactionAutocompleteValue) return false;

  const thisAutocompleteValueObj = autocompleteDataAttrSlice[transactionAutocompleteValue] || {},
    thisAutocompleteValueOccurencyCount = Object.values(thisAutocompleteValueObj).reduce(
      (acc, curr) => (acc += curr),
      0,
    ),
    thisCompletedValueOccurencies = thisAutocompleteValueObj[transactionCompletedValue] || 0;

  return (
    thisCompletedValueOccurencies > countSetting &&
    // We first check if it is higher than 0, because otherwise it is `Infinity`, which
    // is bigger than anything :)
    thisAutocompleteValueOccurencyCount != 0 &&
    thisCompletedValueOccurencies / thisAutocompleteValueOccurencyCount > percentSetting
  );
};

export const shouldTransactionBeAutoResolved = ({
  transaction,
  settings,
  autocompleteData,
}: {
  transaction: InitialTransactionState;
  settings: AutomationSettings;
  autocompleteData: StoreValue<typeof autocompleteDataStore>;
}) => {
  const { categoryId, walletUserId, autocomplete } = transaction;
  if (!categoryId || !walletUserId) return false;

  const { automationPower } = settings,
    transactionCountAccordingToSettings = countCurrentValueAccordingToSettings(
      transactionCountToResolveSingleMin,
      transactionCountToResolveSingleMax,
      automationPower,
    ),
    thisResultThresholdPercent = countCurrentValueAccordingToSettings(
      thisResultThresholdPercentMin,
      thisResultThresholdPercentMax,
      automationPower,
    );

  // We always take account number into consideration
  let shouldAutoResolve = checkTransactionAutocompleteAttrAgainstAutocompleteData(
    autocomplete.accountNumber,
    walletUserId,
    autocompleteData.accountNumber,
    transactionCountAccordingToSettings,
    thisResultThresholdPercent,
  );

  /**
   * We may get a transaction with both merchant and MCC code. It may have very strong
   * signal to autoresolve from MCC, but not merchant (e.g., MCC for a restaurant, but
   * an unknown place).
   *
   * If any of these two indicate the transaction should auto-resolve, then it will
   * autoresolve.
   */
  let merchantResult = false;
  if (autocomplete.merchant)
    merchantResult = checkTransactionAutocompleteAttrAgainstAutocompleteData(
      autocomplete.merchant,
      categoryId,
      autocompleteData.merchant,
      transactionCountAccordingToSettings,
      thisResultThresholdPercent,
    );

  let mccResult = false;
  if (autocomplete.mcc)
    mccResult = checkTransactionAutocompleteAttrAgainstAutocompleteData(
      autocomplete.mcc,
      categoryId,
      autocompleteData.mcc,
      transactionCountAccordingToSettings,
      thisResultThresholdPercent,
    );

  return shouldAutoResolve && (merchantResult || mccResult);
};

export const shouldAutoResolveAll = ({
  settings,
  transactionCount,
}: {
  settings: AutomationSettings;
  transactionCount: number;
}) => {
  if (settings.disableAutomation) return false;

  const countAccordingToSettings = countCurrentValueAccordingToSettings(
    transactionCountToResolveAllMin,
    transactionCountToResolveAllMax,
    settings.automationPower,
  );

  return transactionCount >= countAccordingToSettings;
};
