import { BuildValidateFunction, CleanFunction } from './types';

// Clean
export const ensureArray: CleanFunction = (arr?: any[]) => arr || [],
  uniqueOnly: CleanFunction = (arr: any[]) => [...new Set(arr)];

const getKey = (key: string) => `common.errors.field.array.${key}`;

// Validation
export const maxArrLength: BuildValidateFunction<number> = max => (arr: any[]) => {
    if (arr.length > max) return { key: getKey('lessThan'), values: { than: max } };
  },
  minArrLength: BuildValidateFunction<number> = min => (arr: any[]) => {
    if (arr.length < min) return { key: getKey('moreThan'), values: { than: min } };
  };
