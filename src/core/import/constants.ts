export const encodings = [
  { group: 'Universal', choices: ['utf-8'] },
  {
    group: 'Latin',
    choices: [
      { value: 'iso-8859-2', label: 'iso-8859-2 (latin-2 — Central Europe)' },
      { value: 'iso-8859-3', label: 'iso-8859-3 (latin-3 —  Turkish)' },
      { value: 'iso-8859-4', label: 'iso-8859-4 (latin-4 — North Europe)' },
      { value: 'iso-8859-10', label: 'iso-8859-10 (latin-6 — Nordic)' },
      { value: 'iso-8859-13', label: 'iso-8859-13 (latin-7 — Baltic)' },
      { value: 'iso-8859-14', label: 'iso-8859-14 (latin-8 — Celtic)' },
      { value: 'iso-8859-15', label: 'iso-8859-15 (latin-9)' },
      { value: 'iso-8859-16', label: 'iso-8859-16 (latin-10 — Eastern Europe)' },
      'macintosh',
      { value: 'windows-874', label: 'windows-874 (Latin/Thai)' },
      { value: 'windows-1250', label: 'windows-1250 (Europe)' },
      { value: 'windows-1252', label: 'windows-1252 (Europe)' },
      { value: 'windows-1254', label: 'windows-1254 (Turkish)' },
      { value: 'windows-1257', label: 'windows-1257 (Baltic)' },
      { value: 'windows-1258', label: 'windows-1258 (Vietnamese)' },
    ],
  },
  {
    group: 'Cyrillic',
    choices: [
      'windows-1251',
      { value: 'iso-8859-5', label: 'iso-8859-5 (Latin/Cyrillic)' },
      'koi8-r',
      'koi8-u',
      'x-mac-cyrillic',
      { value: 'ibm866', label: 'ibm866 (DoS)' },
    ],
  },
  {
    group: 'Hebrew',
    choices: [
      { value: 'iso-8859-8', label: 'iso-8859-8 (Latin/Hebrew)' },
      { value: 'windows-1255' },
    ],
  },

  {
    group: 'Arabic',
    choices: [
      { value: 'iso-8859-6', label: 'iso-8859-6 (Latin/Arabic)' },
      { value: 'windows-1256' },
    ],
  },
  {
    group: 'Greek',
    choices: [{ value: 'iso-8859-7', label: 'iso-8859-7 (latin/greek)' }, 'windows-1253'],
  },
  {
    group: 'Chinese',
    choices: ['gbk', 'gb18030', 'hz-gb-2312', 'big5'],
  },
  {
    group: 'Japanese',
    choices: ['euc-jp', 'iso-2022-jp', 'shift-jis'],
  },
  {
    group: 'Korean',
    choices: ['euc-kr', 'iso-2022-kr'],
  },
];

export const decimalDelimitersChoices = ['.', ',', { label: 'Space', value: ' ' }];

export type CurrencyMatcher = { c: string; s: string[] };
/**
 * Since so many currencies use dollar sign, the array is sorted by the popularity from here:
 * https://en.wikipedia.org/wiki/Currency#Control_and_production
 */
export const currencySymbolMatch: CurrencyMatcher[] = [
  { c: 'USD', s: ['$', 'US$'] },
  { c: 'EUR', s: ['€'] },
  { c: 'JPY', s: ['¥', 'JP¥'] },
  { c: 'GBP', s: ['£'] },
  { c: 'AUD', s: ['$', 'A$', 'AU$'] },
  { c: 'CAD', s: ['$', 'CA$', 'Can$', 'C$'] },
  { c: 'CNY', s: ['元', '¥'] },
  { c: 'HKD', s: ['$', '元', 'HK$'] },
  { c: 'NZD', s: ['$', 'NZ$'] },
  { c: 'SEK', s: ['kr'] },
  { c: 'KRW', s: ['₩'] },
  { c: 'SGD', s: ['$', 'S$', 'SG$'] },
  { c: 'NOK', s: ['kr'] },
  { c: 'MXN', s: ['$', 'Mex$'] },
  { c: 'INR', s: ['₹'] },
  { c: 'RUB', s: ['₽', 'р', 'руб'] },
  { c: 'ZAR', s: ['R'] },
  { c: 'TRY', s: ['₺', 'TL'] },
  { c: 'BRL', s: ['$', 'R$'] },
  { c: 'TWD', s: ['$', 'NT$', 'NT'] },
  { c: 'DKK', s: ['kr'] },
  { c: 'PLN', s: ['zł'] },
  { c: 'THB', s: ['฿'] },
  { c: 'IDR', s: ['Rp'] },
  { c: 'HUF', s: ['Ft'] },
  { c: 'CZK', s: ['Kč'] },
  { c: 'ILS', s: ['₪'] },
  { c: 'CLP', s: ['$', 'CLP$', 'peso'] },
  { c: 'PHP', s: ['₱'] },
  { c: 'AED', s: ['د.إ', 'DH', 'Dhs'] },
  { c: 'COP', s: ['$', 'COL$'] },
  { c: 'SAR', s: ['ر.س', '﷼'] },
];

export enum FieldResolution {
  ignore = 'ignore',

  amount = 'amount',
  datetime = 'datetime',

  originalAmount = 'originalAmount',
  currency = 'currency',

  mcc = 'mcc',
  merchant = 'merchant',
  accountNumber = 'accountNumber',
}
export const fieldChoices = [
  { value: FieldResolution.ignore, label: 'cmps.csv.scheme.ignore' },
  { value: FieldResolution.amount, label: 'cmps.transaction.common.amount' },
  { value: FieldResolution.datetime, label: 'cmps.transaction.common.date' },
  { value: FieldResolution.originalAmount, label: 'cmps.transaction.form.originalAmount' },
  { value: FieldResolution.currency, label: 'cmps.transaction.form.originalCurrency' },
  { value: FieldResolution.accountNumber, label: 'cmps.transaction.form.account' },
  { value: FieldResolution.mcc, label: 'cmps.transaction.form.mcc' },
  { value: FieldResolution.merchant, label: 'cmps.transaction.form.merchant' },
];

export enum CsvParsedTransactionResolution {
  auto = 'a',
  save = 's',
  draft = 'd',
  ignore = 'i',
}
