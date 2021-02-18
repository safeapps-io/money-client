import { format } from 'date-fns';

import { SimpleNumberParser } from '@/utils/number';
import { getObjectHash } from '@/utils/getObjectHash';

import {
  ParsedTransaction,
  ParseErrorCodes,
  RowBasedParseError,
  SchemeRunner,
  SimpleScheme,
} from '../types';
import { getCurrencyFromSymbol, parseDateDeterministically } from '../common';

const currencyExample = 'EUR',
  /**
   * The goal of this function is to validate the input of '$' or 'USD' as a valid
   * currency.
   */
  validateCurrency = (
    cellData: string,
    addError: (code: ParseErrorCodes, example: string) => void,
  ) => {
    try {
      new Intl.NumberFormat('en', { style: 'currency', currency: cellData });
      return cellData;
    } catch (error) {
      return (
        getCurrencyFromSymbol(cellData) ||
        addError(ParseErrorCodes.invalidCurrency, currencyExample)
      );
    }
  };

type SimpleSchemeMinRequiredFields = Pick<
  SimpleScheme,
  'fieldnameMap' | 'transformDateFormat' | 'decimalDelimiterChar'
> & { id?: string };

export const runSimpleScheme: SchemeRunner<SimpleSchemeMinRequiredFields> = async ({
  data,
  scheme,
  ignoredTransactionHashSet,
}) => {
  const numberParser = new SimpleNumberParser(scheme.decimalDelimiterChar),
    rowBasedParseErrors: RowBasedParseError[] = [],
    schemeFits = data[0]?.length == scheme.fieldnameMap.length,
    numberExample = numberParser.getValidExample();

  let dateExample = '';
  try {
    dateExample = format(0, scheme.transformDateFormat);
  } catch (error) {}

  const mapFn = async (row: string[], rowIndex: number) => {
    let isValid = true;
    const parsedTr = scheme.fieldnameMap.reduce(
      (result, field, columnIndex) => {
        // We treat `fieldname: null` as a directive to skip the column.
        if (!result || !field) return result;

        result.imported = {
          scheme: scheme?.id,
          rowData: row,
        };

        const cell = row[columnIndex],
          addError = (code: ParseErrorCodes, example: string) => {
            isValid = false;
            rowBasedParseErrors.push({
              code,
              example,

              cellContent: cell,

              row: rowIndex,
              column: columnIndex,
            });
          };

        switch (field) {
          case 'amount':
          case 'originalAmount': {
            try {
              const parsedNumber = numberParser.parse(cell);
              if (Number.isNaN(parsedNumber)) throw new Error();
              result[field as 'amount' | 'originalAmount'] = parsedNumber;
            } catch (error) {
              addError(ParseErrorCodes.invalidNumber, numberExample);
            }
            break;
          }

          case 'datetime': {
            try {
              const parsedDate = parseDateDeterministically(
                cell,
                scheme.transformDateFormat,
              ).getTime();
              if (Number.isNaN(parsedDate)) throw new Error();
              result[field as 'datetime'] = parsedDate;
            } catch (error) {
              addError(ParseErrorCodes.invalidDate, dateExample);
            }
            break;
          }

          case 'currency': {
            const res = validateCurrency(cell, addError);
            if (typeof res == 'string') result[field as 'currency'] = res;
            break;
          }

          case 'mcc':
          case 'accountNumber':
          case 'merchant':
            result.autocomplete[field as 'mcc' | 'accountNumber' | 'merchant'] = cell;
        }

        return result;
      },
      { autocomplete: {} } as ParsedTransaction,
    );
    if (isValid) {
      parsedTr.autocomplete.sourceDataHash = await getObjectHash({
        amount: parsedTr.amount,
        datetime: parsedTr.datetime,
      });
      return parsedTr;
    }

    return null;
  };

  // We don't even try to parse the data if scheme's and row's lengths are not the same
  const unfilteredTransactions = await Promise.all((schemeFits ? data : []).map(mapFn)),
    parsedRows = unfilteredTransactions.filter(
      tr => tr && !ignoredTransactionHashSet.has(tr.autocomplete.sourceDataHash!),
    ) as BooleanCheck<ArrayItem<typeof unfilteredTransactions>>[];

  return { schemeFits: schemeFits && !!parsedRows.length, scheme, rowBasedParseErrors, parsedRows };
};
