import type { BuildValidateFunction, CleanFunction } from './types';

const getKey = (key: string) => `common.errors.field.object.${key}`;

export const ensureJson: CleanFunction = (val: string) => {
  try {
    return JSON.parse(val);
  } catch (error) {
    return getKey('invalid');
  }
};

export const validateArrayJsonByType: BuildValidateFunction<{
  [fieldName: string]: string;
}> = keysAndTypes => (val: Object[]) => {
  if (!Array.isArray(val)) return getKey('invalidArray');

  for (const [key, value] of Object.entries(val)) {
    if (!Object.prototype.hasOwnProperty.call(keysAndTypes, key))
      return { key: getKey('wrongKey'), values: { key } };
    if (typeof value != keysAndTypes[key])
      return {
        key: getKey('wrongValue'),
        values: { key, value: value.toString() || '' },
      };
  }
};
