import type { CustomScheme } from '$core/import/types';

import { parseDateDeterministically } from '$core/import/common';
import { exportDateFormat, exportTagsDelimiter } from '$core/export/exportAll';

const amountI = 2,
  originalAmountI = 3,
  originalCurrencyI = 4,
  dateI = 5,
  descriptionI = 6,
  tagsI = 7,
  mccI = 10,
  accountI = 11,
  merchantI = 12;

function* handler(rows: string[][]) {
  for (const row of rows) {
    const amount = +row[amountI],
      originalAmount = row[originalAmountI] ? +row[originalAmountI] : undefined,
      currency = row[originalCurrencyI] || undefined,
      datetime = parseDateDeterministically(row[dateI], exportDateFormat).getTime(),
      description = row[descriptionI],
      tags = row[tagsI] ? row[tagsI].split(exportTagsDelimiter) : undefined,
      autocomplete = {
        mcc: row[mccI] || undefined,
        account: row[accountI] || undefined,
        merchant: row[merchantI] || undefined,
      };

    yield {
      amount,
      datetime,
      originalAmount,
      currency,
      description,
      tags,
      autocomplete,
      imported: { scheme: id, rowData: row },
    };
  }
}

const id = 'safeMoney_v1';
export const safeMoneyCustomScheme: CustomScheme = {
  id,
  encoding: 'utf-8',
  header: true,
  rowCount: 13,
  handler,
};
