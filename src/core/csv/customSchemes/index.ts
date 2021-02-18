import { getSourceHash } from '../common';
import { CustomScheme, ParsedTransaction, SchemeRunner } from '../types';
import { alfaClickCustomScheme } from './alfaBank/click';
import { alfaDefaultCustomScheme } from './alfaBank/default';
import { revolutCustomScheme } from './revolut';

export const customSchemes = [revolutCustomScheme, alfaDefaultCustomScheme, alfaClickCustomScheme];

export const runCustomScheme: SchemeRunner<CustomScheme> = async ({
  data,
  scheme,
  ignoredTransactionHashSet,
  currentWalletCurrency,
}) => {
  // We don't even try to parse the data if scheme's and row's lengths are not the same
  const sameLength = data[0]?.length == scheme.rowCount,
    parsedRowsWithIgnored =
      sameLength && data.length ? scheme.handler(data, currentWalletCurrency) : null,
    schemeFits = parsedRowsWithIgnored ? !!parsedRowsWithIgnored.length : false;

  /**
   * The contract is that custom scheme would return null/undefined if it cannot parse this
   * source. But since we can feed it a very small subset of data (e.g. 10 lines), that, for
   * example, has other currency than `currentWalletCurrency`, we still want to think this
   * scheme is the correct one.
   */
  const parsedRows = parsedRowsWithIgnored
    ? ((
        await Promise.all(
          parsedRowsWithIgnored.map(async transaction => {
            const hash = await getSourceHash(transaction.amount, transaction.datetime);
            if (ignoredTransactionHashSet.has(hash)) return;

            return {
              ...transaction,
              autocomplete: { ...transaction.autocomplete, sourceDataHash: hash },
            };
          }),
        )
      ).filter(Boolean) as ParsedTransaction[])
    : [];

  return {
    schemeFits,
    scheme,
    parsedRows,
    rowBasedParseErrors: [],
  };
};
