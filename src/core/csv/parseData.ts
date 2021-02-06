import { parseCsv } from './parseCsv';
import { runSimpleScheme } from './simpleSchemes';
import { BaseSimpleScheme, CustomScheme } from './types';
import { runCustomScheme } from './customSchemes';

export type ParseDataReturn = ThenArg<ReturnType<typeof parseData>>;

export const parseData = async ({
  data,
  scheme,
  currentWalletCurrency,
  ignoredTransactionHashSet,
  preview,
}: {
  data: string;
  scheme: BaseSimpleScheme | CustomScheme;
  currentWalletCurrency: string;
  ignoredTransactionHashSet: Set<string>;
  preview?: number;
}) => {
  const { dataRows: parsedCsvData, errors: parseErrors, headerRow } = await parseCsv({
      data,
      config: scheme,
      preview,
    }),
    runnerArgs = { data: parsedCsvData, ignoredTransactionHashSet, currentWalletCurrency },
    parsedData = await ('handler' in scheme
      ? runCustomScheme({ ...runnerArgs, scheme })
      : runSimpleScheme({ ...runnerArgs, scheme }));

  return {
    ...parsedData,
    scheme,
    parseErrors,
    headerRow,
  };
};
