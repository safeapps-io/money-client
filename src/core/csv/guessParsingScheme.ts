import { BaseSimpleScheme } from './types';
import { customSchemes } from './customSchemes';
import { bufferToString } from '@/utils/buffer/conversions';
import { parseData } from './parseData';

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
