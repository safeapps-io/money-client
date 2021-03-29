import { browser } from '$app/env';

import { parseDateDeterministically } from './common';
import { ParsedTransaction } from './types';

const parser = browser ? new DOMParser() : null,
  parseOfx = (data: string) => parser!.parseFromString(data, 'application/xml'),
  getContentByTagName = (el: Element, tag: string) => el.querySelector(tag)!.textContent!;

const ofxDateRegex = /\[(\+\d).*\]/;
/**
 * @param dateString OFX date. looks like this: 20210214125534.000[+3:MSK]
 */
const parseOfxDate = (dateString: string) => {
  const dateNoTz = dateString.replace(ofxDateRegex, ''),
    tzUnpadded = ofxDateRegex.exec(dateString)![1],
    paddedTz = tzUnpadded.length == 2 ? `${tzUnpadded[0]}0${tzUnpadded[1]}` : tzUnpadded;

  return parseDateDeterministically(`${dateNoTz} ${paddedTz}`, 'yyyyMMddHHmmss.SSS X');
};

export function* parseOfxData({
  data,
  currentWalletCurrency,
  previousOfxIdsSet,
}: {
  data: string;
  currentWalletCurrency: string;
  previousOfxIdsSet: Set<string>;
}): Generator<ParsedTransaction> {
  const parsed = parseOfx(data),
    accountsDataElements = parsed.getElementsByTagName('STMTRS');

  for (const accountData of Array.from(accountsDataElements)) {
    const currency = accountData.querySelector('CURDEF')!.textContent;
    if (currency != currentWalletCurrency) continue;

    const accountNumber = accountData.querySelector('ACCTID')!.textContent!,
      transactionElements = accountData.querySelectorAll('STMTTRN');

    for (const transactionEl of Array.from(transactionElements)) {
      const getContent = (tag: string) => getContentByTagName(transactionEl, tag);

      const id = getContent('FITID');
      if (previousOfxIdsSet.has(id)) continue;

      const originalCurrency = getContent('CURSYM'),
        changeRate = parseInt(getContent('CURRATE')),
        amount = parseInt(getContent('TRNAMT')),
        origCurrencyData =
          changeRate == 1 ? {} : { originalCurrency, originalAmount: amount * changeRate };

      yield {
        amount,
        datetime: parseOfxDate(getContent('DTPOSTED')).getTime(),
        ...origCurrencyData,
        imported: { scheme: 'ofx', ofxEl: transactionEl.innerHTML },
        autocomplete: {
          id: getContent('FITID'),
          merchant: getContent('NAME'),
          accountNumber,
        },
      };
    }
  }
}
