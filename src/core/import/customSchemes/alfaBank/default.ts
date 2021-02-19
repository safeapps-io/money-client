import { SimpleNumberParser } from '@/utils/number';
import {
  getApplicableSymbolsByCurrency,
  parseDateDeterministically,
  processCurrencySymbol,
} from '@/core/import/common';
import { CustomScheme } from '@/core/import/types';
import { transformCurrencyCode } from './transformCurrencyCode';

const formatString = 'dd.MM.yyyy';

const enum TableColumns {
  date,
  accountNumber,
  reference,
  sidenote,
  income,
  expense,
  currency,
}

/**
 * Example in Russian:
 *
 * Дата;Номер_счета;Референс;Примечание;Приход;Расход;Валюта
 * 16.08.2020;40817978007740004324;32Y2CY;"TU002820\SVN\LJUBLJANA\VIL\BIOLAB D O O 613.34 EUR";;-613.34;€
 */
function* handler(rows: string[][], currentWalletCurrency: string) {
  // Has the same delimiter everywhere
  const parser = new SimpleNumberParser('.'),
    applicableSymbols = getApplicableSymbolsByCurrency(currentWalletCurrency);

  const sidenodeDelimiter = '\\',
    parseSidenote = (
      cell: string,
      multiplier: number,
    ): {
      description?: string;
      currency?: string;
      originalAmount?: number;
      merchant?: string;
    } => {
      // Banking fee transactions does not have anything inside, e.g.:
      // "Ком.за пер.с исп.рас.карты АО"АЛЬФА-БАНК ",вып.к Тек.сч.Кл.,на сч.карты стор.банк.Согл.тар.Банка <name>"
      if (!cell.includes(sidenodeDelimiter)) return { description: cell };

      /**
       * It has a bunch of data here, all completely mixed up, e.g:
       * (unknown) - (unknown) - (city) - (unknown) - (merchant + original tr)
       * TU002820\SVN\LJUBLJANA\VIL\BIOLAB D O O 613.34 EUR
       *
       * (nothing) - (country) - (unknown) - (unknown) - (merchant + original tr)
       * \IRL\88005556734\H\APPLE COM BIL 399.00 RUR
       *
       * or even this:
       * (index) - (unknown) - (city) - (merchant + original tr)
       * 193571\643\MOSKVA\CARD2CARD AMO 500.00 EUR
       *
       * So I don't see a point in parsing anything except the last part. Everything else
       * seems to be somewhat random and, probably, irrelevant. Maybe we should just save it
       * for the future refferences and that's it.
       */
      const splitted = cell.split(sidenodeDelimiter).pop()?.split(' ');
      // Some unknown format, what the heck
      if (!splitted || splitted.length < 3) return {};

      const currency = transformCurrencyCode(splitted.pop()!);

      return {
        currency,
        // Always seems to be a valid integer without any delimiters besides `.`
        originalAmount: +splitted.pop()! * multiplier,
        merchant: splitted.join(' ')!,
      };
    };

  for (const row of rows) {
    /**
     * Ignoring transactions with HOLD status. Two reasons:
     * 1. not sure if it is right to import them at all, since they are not yet commited
     * 2. they have a very different format of the 3rd cell, which makes them difficult
     * to process.
     *
     * Also we only want the transactions which has the currency of current wallet.
     */
    if (
      !row[TableColumns.accountNumber] ||
      !applicableSymbols.includes(processCurrencySymbol(row[TableColumns.currency]))
    )
      continue;

    // `.` is the delimiter
    // expenses has minus sign, incomes do not
    const amount = parser.parse(row[TableColumns.expense] ?? row[TableColumns.income]),
      multiplier = amount < 0 ? -1 : 1,
      datetime = parseDateDeterministically(row[TableColumns.date], formatString).getTime(),
      { merchant, ...rest } = parseSidenote(row[TableColumns.sidenote], multiplier);

    yield {
      amount,
      datetime,
      ...rest,
      autocomplete: {
        accountNumber: row[TableColumns.accountNumber],
        merchant,
      },
      imported: { scheme: id, rowData: row },
    };
  }
}

const id = 'alfadefault_v1';
export const alfaDefaultCustomScheme: CustomScheme = {
  id,
  encoding: 'utf-8',
  header: true,
  rowCount: 7,
  handler,
};
