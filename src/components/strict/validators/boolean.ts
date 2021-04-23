import type { BuildValidateFunction, CleanFunction } from './types';

// Clean
export const ensureBoolean: CleanFunction = (val?: boolean) => !!val;

// Validate
export const needValue: BuildValidateFunction<boolean> = neededValue => (val: boolean) => {
  if (neededValue !== val) return 'common.errors.field.bool';
};
