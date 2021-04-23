import type {
  BuildValidateFunction,
  BuildValidateFunctionWithOptional,
  CleanFunction,
  ValidateFunction,
} from './types';

// Clean
export const ensureString: CleanFunction = (val?: string) => (typeof val === 'string' ? val : ''),
  optionalString: CleanFunction = (val?: string) =>
    typeof val === 'string' && val ? val : undefined,
  trim: CleanFunction = (val: string) => val.trim();

const getKey = (key: string) => `common.errors.field.string.${key}`;

// Validate
const usernameRegex = /^[a-zA-Z0-9_.-]+$/,
  emailRegex = /^\S+@\S+$/,
  hexColorRegex = /^#([A-Fa-f0-9]{6})$/,
  numberRegex = /^\d+$/;
export const usernameFormat: ValidateFunction = (val: string) => {
    if (!usernameRegex.test(val)) return getKey('username');
  },
  emailFormat: ValidateFunction = (val: string) => {
    if (!emailRegex.test(val)) return getKey('email');
  },
  hexColorFormat: ValidateFunction = (val: string) => {
    if (!hexColorRegex.test(val)) return getKey('hexColor');
  },
  numberFormat: ValidateFunction = (val: string) => {
    if (!numberRegex.test(val)) return getKey('number');
  },
  minLength: BuildValidateFunctionWithOptional<number> = (min = 1) => (val: string) => {
    if (val.length < min) return { key: getKey('minLength'), values: { than: min } };
  },
  maxLength: BuildValidateFunctionWithOptional<number> = (max = 100) => (val: string) => {
    if (val.length > max) return { key: getKey('maxLength'), values: { than: max + 1 } };
  },
  oneOf: BuildValidateFunction<any[]> = choices => (val: string) => {
    if (!choices.includes(val)) return { key: getKey('choice'), values: { choice: val } };
  };
