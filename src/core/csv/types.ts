import { ParseError } from 'papaparse';

import { OmitCommonFields, Transaction } from '@/stores/decr/types';

export type ParsingSettings = {
  encoding: string;
  header: boolean;
  delimiter?: string | null;
  newline?: string | null;
  quoteChar?: string | null;
  escapeChar?: string | null;
};

export type ParsingResult = { dataRows: string[][]; errors: ParseError[]; headerRow?: string[] };

export type ParsedTransaction = Pick<Transaction, 'amount' | 'datetime'> &
  Partial<Pick<Transaction, 'originalAmount' | 'currency' | 'description'>> & {
    autocomplete: Partial<Transaction['autocomplete']>;
    imported: Transaction['imported'];
  };
export type InitialTransactionState = WithOptional<OmitCommonFields<Transaction>, 'walletUserId'>;

export type RowBasedParseError = {
  row: number;
  column: number;
  code: ParseErrorCodes;
  cellContent: string;
  example: string;
};

export enum ParseErrorCodes {
  invalidNumber = 'in',
  invalidDate = 'id',
  invalidCurrency = 'ic',
}

export type AutomationSettings = {
  disableAutomation: boolean;
  /** from 0 to 1 */
  automationPower: number;
};

export type CustomSchemeHandler = (
  rows: string[][],
  currentWalletCurrency: string,
) => Generator<ParsedTransaction | undefined>;

export type CustomScheme = BaseScheme & {
  id: string;
  rowCount: number;
  handler: CustomSchemeHandler;
};

export type GuessedScheme = CustomScheme | SimpleScheme;

export type SchemeRunner<T> = (args: {
  scheme: T;
  data: string[][];
  ignoredTransactionHashSet: Set<string>;
  currentWalletCurrency: string;
}) => Promise<{
  schemeFits: boolean;
  scheme: T;
  rowBasedParseErrors: RowBasedParseError[];
  parsedRows: ParsedTransaction[];
}>;

export type AllowedSchemeFields = keyof Pick<
  Transaction,
  'amount' | 'datetime' | 'originalAmount' | 'currency'
> &
  Omit<keyof Transaction['autocomplete'], 'sourceDataHash'>;

export type BaseScheme = {
  encoding: string;
  header: boolean;

  delimiter?: string | null;
  newline?: string | null;
  quoteChar?: string | null;
  escapeChar?: string | null;
};

export type BaseSimpleScheme = BaseScheme & {
  decimalDelimiterChar: string;
  transformDateFormat: string;
  fieldnameMap: Array<AllowedSchemeFields | null>;
};

export type SimpleScheme = {
  id: string;
  updated: number;
  created: number;
  published: boolean;

  title: string;
} & BaseSimpleScheme;
