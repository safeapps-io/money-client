import { bufferToString } from '@/utils/buffer/conversions';
import { parseCsv } from './parseCsv';
import { runSimpleScheme } from './simpleSchemes';
import { BaseSimpleScheme, CustomScheme } from './types';
import { customSchemes, runCustomScheme } from './customSchemes';

const previewLines = 15;

/**
 * Primary goal of this function is to get current state of SimpleSchemes and guess
 * which of them or CustomSchemes can be applied to this set of data.
 */
export const guessParsingScheme = async ({
  data,
  schemes,
  currentWalletCurrency,
}: {
  data: ArrayBuffer;
  schemes: BaseSimpleScheme[];
  currentWalletCurrency: string;
}) => {
  const commonArgs = {
    ignoredTransactionHashSet: new Set<string>(),
    preview: previewLines,
    currentWalletCurrency,
  };

  const result = await Promise.all(
    [...customSchemes, ...schemes].map(scheme =>
      parseData({ ...commonArgs, scheme, data: bufferToString(data, scheme.encoding) }),
    ),
  );

  console.debug('[csv] guessing result', { result });

  return result.find(
    option => option.schemeFits && !option.parseErrors.length && !option.rowBasedParseErrors.length,
  )?.scheme;
};

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
