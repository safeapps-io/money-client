import { isBefore } from 'date-fns';

import { inputParseDate } from '$utils/date';
import type { BuildValidateFunction, CleanFunction } from './types';

const getNumberKey = (key: string) => `common.errors.field.number.${key}`,
  getDateKey = (key: string) => `common.errors.field.date.${key}`;

// Clean
export const ensureNumber: CleanFunction = (val?: string) => {
    let res: number | undefined;
    if (typeof val !== 'undefined') res = +val;
    if (typeof res === 'undefined' || Number.isNaN(res)) return getNumberKey('invalid');
    return res;
  },
  ensureDate: CleanFunction = (val?: string) => {
    try {
      const res = inputParseDate(val || '');
      return res.getTime();
    } catch (error) {
      return 0;
    }
  };

// Validate
export const moreThan: BuildValidateFunction<number> = than => (val: number) => {
    if (val <= than) return { key: getNumberKey('moreThan'), values: { than } };
  },
  lessThan: BuildValidateFunction<number> = than => (val: number) => {
    if (val <= than) return { key: getNumberKey('lessThan'), values: { than } };
  },
  dateIsBefore: BuildValidateFunction<Date> = than => (val: number) => {
    if (!isBefore(val, than)) return { key: getDateKey('before'), values: { than } };
  },
  dateIsAfter: BuildValidateFunction<Date> = than => (val: number) => {
    if (isBefore(val, than)) return { key: getDateKey('after'), values: { than } };
  };
