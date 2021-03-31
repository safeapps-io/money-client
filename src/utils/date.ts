import {
  lightFormat,
  parse,
  differenceInDays,
  startOfDay,
  subDays,
  isAfter,
  differenceInCalendarDays,
  format,
} from 'date-fns/esm';

import { ru } from 'date-fns/esm/locale';
import { derived } from 'svelte/store';
import { locale } from 'svelte-i18n';

const inputFormat = 'yyyy-MM-dd';
export const inputFormatDate = (dt: Date | number) => lightFormat(dt, inputFormat);
export const inputParseDate = (val: string) => {
  const res = parse(val, inputFormat, 0);
  if (!res.getTime()) throw new Error(`Invalid date string: ${val}`);
  return res;
};

export const getPrevStartDate = (startDate: Date | number, endDate: Date | number) => {
  if (!isAfter(endDate, startDate)) throw new Error('Swap dates');
  const gap = differenceInDays(endDate, startDate);
  return { date: subDays(startOfDay(startDate), gap), gap };
};

export const dateRelativeFormat = (dt: Date | number) => {
  const diff = differenceInCalendarDays(new Date(), dt);
  if (diff === 0) return 'Сегодня';
  else if (diff === 1) return 'Вчера';
  else return format(dt, 'dd.MM.yyyy, eeeeee', { locale: ru });
};

export const getMonthName = derived(locale, $locale => {
  const f = new Intl.DateTimeFormat($locale, { month: 'long' });
  return (dt: Date) => f.format(dt);
});
