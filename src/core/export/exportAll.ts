import type { Category, FullEntity, Transaction, WalletUser } from '$stores/decr/types';

import { format } from 'date-fns/esm';
import { get } from 'svelte/store';
import Papa from 'papaparse';
import { _ as getTranslationStore } from 'svelte-i18n';

const exportCSV = (data: Object[]): string => Papa.unparse(data, { escapeFormulae: true });

export const exportAll = (
  transactions: FullEntity<Transaction>[],
  categories: { [id: string]: FullEntity<Category> },
  walletUsers: { [id: string]: FullEntity<WalletUser> },
) => {
  const _ = get(getTranslationStore);

  return exportCSV(
    transactions.map(({ id, decr }) => ({
      ID: id,
      [_('cmps.export.columns.draft')]: decr.isDraft ? 1 : 0,
      [_('cmps.transaction.common.amount')]: decr.amount,
      [_('cmps.transaction.form.originalAmount')]: decr.originalAmount || '',
      [_('cmps.transaction.form.originalCurrency')]: decr.currency || '',
      [_('cmps.transaction.common.date')]: format(decr.datetime, exportDateFormat),
      [_('cmps.transaction.form.description.label')]: decr.description || '',
      [_('cmps.transaction.form.tags.label')]: (decr.tags || []).join(exportTagsDelimiter),
      [_('cmps.category.common.category')]: decr.categoryId
        ? categories[decr.categoryId]?.decr.name || ''
        : '',
      [_('cmps.transaction.form.user')]: decr.walletUserId
        ? walletUsers[decr.walletUserId]?.decr.name || ''
        : '',

      [_('cmps.transaction.form.mcc')]: decr.autocomplete.mcc || '',
      [_('cmps.transaction.form.account')]: decr.autocomplete.accountNumber || '',
      [_('cmps.transaction.form.merchant')]: decr.autocomplete.merchant || '',
    })),
  );
};

export const exportDateFormat = 'dd.MM.yyyy HH:mm:ss',
  exportTagsDelimiter = ', ';
