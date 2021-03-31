import { isValid, parse } from 'date-fns/esm';

const formats = [
  // ISO-ish: https://en.wikipedia.org/wiki/ISO_8601
  "yyyy-MM-dd'T'HH:mm:ss.SSSxxx",
  'yyyy-MM-dd',
  // Europe
  'dd.MM.yyyy',
  // US
  'MM/dd/yyyy',

  // Common
  'dd.MM.yyyy HH:mm:ss',
];

/**
 * Will return the first date format, that complies with every date string provided
 * in the sample. Otherwise — undefined.
 */
export const guessDateFormat = (dateStrings: string[]): string | undefined => {
  for (const format of formats) {
    try {
      dateStrings.forEach(string => {
        if (!isValid(parse(string, format, new Date()))) throw new Error();
      });
      return format;
    } catch (error) {}
  }
};
