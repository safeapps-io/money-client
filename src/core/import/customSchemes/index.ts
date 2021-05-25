import { getSourceHash } from '../common';
import type { CustomScheme, ParsedTransaction, SchemeRunner } from '../types';
import { alfaClickCustomScheme } from './alfaBank/click';
import { alfaDefaultCustomScheme } from './alfaBank/default';
import { revolutCustomScheme } from './revolut';
import { safeMoneyCustomScheme } from './safeMoney';

export const customSchemes = [
  revolutCustomScheme,
  alfaDefaultCustomScheme,
  alfaClickCustomScheme,
  safeMoneyCustomScheme,
];

export const runCustomScheme: SchemeRunner<CustomScheme> = async ({
  data,
  scheme,
  ignoredTransactionHashSet,
  currentWalletCurrency,
}) => {
  // We don't even try to parse the data if scheme's and row's lengths are not the same
  const sameLength = data[0]?.length == scheme.rowCount,
    iterator = sameLength && data.length ? scheme.handler(data, currentWalletCurrency) : [];
  let schemeFits = false;

  const promises: Promise<ParsedTransaction | undefined>[] = [];
  for (const transaction of iterator) {
    /**
     * The contract is that custom scheme would return null/undefined if it cannot parse this
     * source. But since we can feed it a very small subset of data (e.g. 10 lines), that, for
     * example, has other currency than `currentWalletCurrency`, we still want to think this
     * scheme is the correct one.
     */
    if (!transaction) break;
    schemeFits = true;

    promises.push(
      getSourceHash(transaction.amount, transaction.datetime).then(hash => {
        if (ignoredTransactionHashSet.has(hash)) return;

        transaction.autocomplete.sourceDataHash = hash;
        return transaction;
      }),
    );
  }

  const parsedRows = (await Promise.all(promises)).filter(Boolean) as ParsedTransaction[];

  return {
    schemeFits,
    scheme,
    parsedRows,
    rowBasedParseErrors: [],
  };
};
