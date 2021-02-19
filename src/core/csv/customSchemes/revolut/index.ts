import { SimpleNumberParser } from '@/utils/number';

import {
  guessDateLocaleForFormat,
  guessDecimalDelimiterByNumberArray,
  parseDateDeterministically,
} from '@/core/csv/common';
import { CustomScheme } from '@/core/csv/types';

/**
 * Dates are formatted based on language and region setting on the device.
 * Open ./dateFormats.js and have a look at my methodology of determining
 * the these.
 */
const formatStrings = [
  'd LLL yyyy',
  'd LLL yyyy г.',
  'yyyy LLL d',
  'd yyyy LLL',
  'LLL d, yyyy',
  'yyyy d LLL',
];

const enum TableColumns {
  date,
  merchant,
  expense,
  income,
  originalExpense,
  originalIncome,
  exchangeRate,
  bankCategory,
}

/**
 * Example in Russian:
 * Completed Date;Reference;Paid Out (EUR);Paid In (EUR);Exchange Out;Exchange In; Balance (EUR);Exchange Rate;Category
 * 29 окт. 2020 г.;Goopti B V;132,00 ;;;;3 724,59 ; ;Транспорт
 */
function* handler(rows: string[][]) {
  const firstDate = rows[0][TableColumns.date];

  let dateLocale: Locale | null = null,
    correctDateFormat: string | null = null;
  for (const formatString of formatStrings) {
    const result = guessDateLocaleForFormat(firstDate, formatString);
    if (result) {
      correctDateFormat = formatString;
      dateLocale = result;
      break;
    }
  }
  if (!dateLocale) return;

  const delimiter = guessDecimalDelimiterByNumberArray(
    rows.map(row => row[TableColumns.income] || row[TableColumns.expense]),
  );
  if (!delimiter) return;

  const numberParser = new SimpleNumberParser(delimiter);

  for (const row of rows) {
    let cellIndex = TableColumns.income,
      multiplier = 1;
    if (row[TableColumns.expense]) {
      cellIndex = TableColumns.expense;
      multiplier = -1;
    }

    let currency: string | undefined = undefined,
      originalAmount: number | undefined = undefined;
    const originalTransactionData =
      row[TableColumns.originalExpense] || row[TableColumns.originalIncome];
    if (originalTransactionData) {
      const [curr, origAmount] = originalTransactionData.split(' ');
      currency = curr;
      originalAmount = numberParser.parse(origAmount) * multiplier;
    }

    const amount = numberParser.parse(row[cellIndex]) * multiplier,
      datetime = parseDateDeterministically(row[0], correctDateFormat!, {
        locale: dateLocale!,
      }).getTime();

    yield {
      amount,
      datetime,
      originalAmount,
      currency,
      autocomplete: {
        merchant: row[1],
      },
      imported: { scheme: id, rowData: row },
    };
  }
}

const id = 'revolut_v1';
export const revolutCustomScheme: CustomScheme = {
  id,
  encoding: 'utf-8',
  header: true,
  rowCount: 9,
  handler,
};
