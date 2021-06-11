import type { NumberValue } from 'd3-scale';
import { locale } from 'svelte-i18n';
import { derived } from 'svelte/store';

const createMoneyFormatter = (locale: string, currency: string) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  });

export const moneyFormat = derived(locale, $locale => {
  const moneyFormatters: { [code: string]: Intl.NumberFormat } = {};

  return (value: number, currency: string) => {
    if (!moneyFormatters[currency])
      moneyFormatters[currency] = createMoneyFormatter($locale, currency);
    return moneyFormatters[currency].format(value);
  };
});

export const percentFormat = derived(locale, $locale => {
  const formatter = new Intl.NumberFormat($locale, {
    style: 'percent',
  });
  return (val: number) => {
    const formatted = formatter.format(val).replace(/\s/g, '');
    return val >= 0 ? `+${formatted}` : formatted;
  };
});

export const parseNumberForCsv = (num: string) => {
  const res = parseFloat(num.replace(/,/g, '.'));
  return Number.isNaN(res) ? undefined : res;
};

/**
 * Mostly taken from here: https://observablehq.com/@mbostock/localized-number-parsing
 */
export class NumberParser {
  private formatter: Intl.NumberFormat;
  private group: RegExp;
  private decimal: RegExp;
  private numeral: RegExp;
  private index: (digit: string) => string;

  constructor(locale: string) {
    this.formatter = new Intl.NumberFormat(locale);

    const parts = this.formatter.formatToParts(12345.6),
      numerals = [
        ...new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210),
      ].reverse(),
      index = new Map(numerals.map((d, i) => [d, i]));

    this.group = new RegExp(`[${parts.find(d => d.type === 'group')!.value}]`, 'g');
    this.decimal = new RegExp(`[${parts.find(d => d.type === 'decimal')!.value}]`);
    this.numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    this.index = d => index.get(d)!.toString();
  }

  parse(string: string) {
    const parsed = string
      .trim()
      .replace(this.group, '')
      .replace(this.decimal, '.')
      .replace(this.numeral, this.index);

    return parsed ? +parsed : NaN;
  }

  getValidExample() {
    return this.formatter.format(112358.13);
  }
}

/**
 * Follows the basic idea: decimal part is always delimited with a certain char.
 */
export class SimpleNumberParser {
  constructor(private decimalDelimiter: string) {}

  parse(string: string) {
    const parsed = string
      .trim()
      // Splitting the string by delimiter. We should have 2 parts: real and decimal number
      .split(this.decimalDelimiter)
      // Replacing every special char in both parts
      .map(part => part.replace(' ', '').replace('.', '').replace(',', ''))
      // Getting a good 'ol parsable integer
      .join('.');

    return parsed ? +parsed : NaN;
  }

  getValidExample() {
    return `1432${this.decimalDelimiter}13`;
  }
}

const formatNumber = (num: number, divider: number, maxVal: number, letter: string) =>
  /**
   * We check if maxVal in the array is less then twice the divider.
   * This way, if we have multiple ticks with the same leading number, we won't stuck
   * with
   * 1k
   * 1k
   * 1k
   * , but with
   * 1.4k
   * 1.2k
   * 1.0k
   */
  (num / divider).toFixed(maxVal < divider * 2 ? 1 : 0) + letter;

export function kFormatter(_num: number | NumberValue | string, maxVal = 0) {
  let num: number;
  if (typeof _num == 'string') num = parseFloat(_num);
  else num = _num.valueOf();

  const noSign = Math.abs(num),
    fixed = num.toFixed();
  if (noSign < 1e3) return fixed;
  if (noSign < 1e6) return formatNumber(num, 1e3, maxVal, 'k');
  if (noSign < 1e9) return formatNumber(num, 1e6, maxVal, 'M');

  return fixed;
}
