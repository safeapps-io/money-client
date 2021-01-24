import { parse, isValid } from 'date-fns';
import * as locales from 'date-fns/locale';

import { getObjectHash } from '@/utils/getObjectHash';
import { currencySymbolMatch } from './constants';

export const guessDateLocaleForFormat = (dateString: string, formatString: string) => {
  const date = new Date();

  for (const locale of Object.values(locales)) {
    const parsed = parse(dateString, formatString, date, { locale });
    if (isValid(parsed)) return locale;
  }
};

export const getDecimalDelimiterByLocaleCode = (locale: string) => {
  const formatter = new Intl.NumberFormat(locale);
  return formatter.formatToParts(1.1).find(({ type }) => type == 'decimal')?.value;
};

const possibleDelimiters = [',', '٫', '.'],
  delimiterRegexes = possibleDelimiters.map(delimiter => ({
    regex: new RegExp(delimiter == '.' ? `\\${delimiter}` : delimiter),
    delimiter,
  }));
/**
 * Here we're trying to guess what is the delimiter used in the number array.
 * It makes a few assumptions:
 * 1. `possibleDelimiters` only. Solid assumption, we've checked it against all the
 * date-fns locales and `Intl.NumberFormatter().formatToParts`
 * 2. the whole array uses the same delimiter — also a solid one
 * 3. the array is big enough — more than 5 items, for example
 * 4. the number HAS a delimiter at all. Not sure if that is true, but it is for
 * most of the currencies in the world
 *
 * Basic idea is very simple: we look for a delimiter in the `possibleDelimiters`
 * in every number, and if the said delimiter is present in every number only once,
 * then it is our thing.
 *
 * This "algo" fails miserably if the subset of numbers is only 1000s (like, 1,234.12).
 * In that case we return nothing.
 */
export const guessDecimalDelimiterByNumberArray = (arr: string[]) => {
  const popularityMap = new Map(possibleDelimiters.map(delim => [delim, 0]));
  for (const numberString of arr) {
    for (const { regex, delimiter } of delimiterRegexes) {
      if (numberString.match(regex)?.length == 1)
        popularityMap.set(delimiter, popularityMap.get(delimiter)! + 1);
    }
  }
  let legibleGuess: string | null = null,
    tooManyGuesses = false;
  for (const [delimiter, count] of popularityMap) {
    if (count == arr.length) {
      if (legibleGuess) tooManyGuesses = true;
      legibleGuess = delimiter;
    }
  }
  return tooManyGuesses ? null : legibleGuess;
};

export const processCurrencySymbol = (symbol: string) => {
    let processedSymbol = symbol.trim();
    if (processedSymbol.startsWith('.')) processedSymbol = processedSymbol.slice(1);
    if (processedSymbol.endsWith('.')) processedSymbol = processedSymbol.slice(0, -1);
    return processedSymbol;
  },
  getCurrencyFromSymbol = (symbol: string) => {
    const processedSymbol = processCurrencySymbol(symbol);
    return currencySymbolMatch.find(currMatch =>
      // Ignoring case and special chars in case there is any
      currMatch.s.some(symbol => symbol.localeCompare(processedSymbol)),
    )?.c;
  },
  getApplicableSymbolsByCurrency = (currency: string) =>
    currencySymbolMatch.find(({ c }) => c == currency)?.s || [];

export const getSourceHash = (amount: number, datetime: number) => {
  return getObjectHash({ amount, datetime });
};
