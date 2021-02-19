import { SimpleNumberParser } from '@/utils/number';
import { parseDateDeterministically } from '@/core/import/common';
import { CustomScheme } from '@/core/import/types';
import { transformCurrencyCode } from './transformCurrencyCode';

const formatString = 'dd.MM.yy';

const enum TableColumns {
  currency = 2,
  datetime = 3,
  sidenote = 5,
  income = 6,
  expense = 7,
}

/**
 * Example in Russian:
 *
 * ТИП СЧЁТА;НОМЕР СЧЕТА;ВАЛЮТА;ДАТА ОПЕРАЦИИ;РЕФЕРЕНС ПРОВОДКИ;ОПИСАНИЕ ОПЕРАЦИИ;ПРИХОД;РАСХОД;
 * Кредитная карта Black;40817810104730088463;RUR;29.11.20;SGRP#18091912723;Козлов Иван Викторович Предоставление транша Дог. F0SGRP20S18091912723 от 210918;136336,41;0;—;
 * Кредитная карта Black;40817810104730088463;RUR;29.11.20;CRD_9X556R;555928++++++5971 99000061\RUS\SANKT PETERBU\PETROELEKTROS 29.11.20 27.11.20 2865.42 RUR MCC4900;0;2865,42;—;
 */
function* handler(rows: string[][], currentWalletCurrency: string) {
  const parser = new SimpleNumberParser(',');

  const sidenodeDelimiter = /\s{2,}(?!\\)/,
    subSidenoteDelimiter = '\\',
    cardTrAttribute = '+++',
    parseSidenote = (
      cell: string,
      multiplier: number,
    ): {
      accountNumber?: string;
      datetime?: number;
      description?: string;
      currency?: string;
      originalAmount?: number;
      merchant?: string;
      mcc?: string;
    } => {
      // Banking fee transactions, bank transfers or such stuff does not have anything inside, e.g.:
      // "Внутрибанковский перевод между счетами, <name>"
      if (!cell.includes(cardTrAttribute)) return { description: cell };

      /**
       * variations:
       * 555928++++++5971    99000061\RUS\SANKT PETERBU\PETROELEKTROS          29.11.20 27.11.20      2865.42  RUR MCC4900
       * 555928++++++5971    11040993\RUS\SANKT PETERBU\OOO ZDOROVE            27.11.20 24.11.20        40.00  RUR (Apple Pay-0002) MCC5411
       * 555928++++++5971        0000\USA\6504851632   \NOTION LABS I          29.11.20 27.11.20        48.00  USD MCC7372
       *
       * (card number) - (sub-sidenote: (nevermind - country - location? - merchant ) - (dates: ( nevermind - date )) - (original amount) - (original currency + mcc + reference stuff))
       */
      const splittedRaw = cell.split(sidenodeDelimiter),
        splittedCleaned: string[] = [];

      splittedRaw.forEach((item, index) => {
        const trimmed = item.trim();
        /**
         * We may have a leading slash in item with index 1. We do not want to append it to the first item (card number).
         * The regex can also split the subnote, like in the case of Notion transaction above. We want to concat them together.
         */
        if (index > 1 && trimmed.startsWith(subSidenoteDelimiter))
          splittedCleaned[index - 1] += trimmed;
        else splittedCleaned[index] = trimmed;
      });

      // Some unknown format, what the heck
      if (splittedCleaned.length != 5) return {};

      const [_currency, ...rest] = splittedCleaned[4].split(' '),
        currency = transformCurrencyCode(_currency),
        mcc = rest.pop()!.replace('MCC', '');

      return {
        accountNumber: splittedCleaned[0],
        datetime: parseDateDeterministically(
          splittedCleaned[2].split(' ').pop()!,
          formatString,
        ).getTime(),
        // Always seems to be a valid integer without any delimiters besides `.`
        merchant: splittedCleaned[1].split(subSidenoteDelimiter).pop(),
        originalAmount: +splittedCleaned[3] * multiplier,
        currency,
        mcc,
      };
    };

  for (const row of rows) {
    if (transformCurrencyCode(row[TableColumns.currency]) != currentWalletCurrency) continue;

    const isIncome = !!parser.parse(row[TableColumns.income]),
      multiplier = isIncome ? 1 : -1,
      amount =
        parser.parse(isIncome ? row[TableColumns.income] : row[TableColumns.expense]) * multiplier,
      { merchant, mcc, accountNumber, datetime: _datetime, ...rest } = parseSidenote(
        row[TableColumns.sidenote],
        multiplier,
      ),
      datetime =
        _datetime || parseDateDeterministically(row[TableColumns.datetime], formatString).getTime();

    yield {
      amount,
      datetime,
      ...rest,
      autocomplete: {
        merchant,
        mcc,
        accountNumber,
      },
      imported: {
        scheme: id,
        rowData: row,
      },
    };
  }
}

const id = 'alfaclick_v1';
export const alfaClickCustomScheme: CustomScheme = {
  id,
  encoding: 'windows-1251',
  header: true,
  rowCount: 9,
  handler,
};
