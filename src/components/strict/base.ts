import type { CleanFunction, ValidateFunction, ValidateValidReturn } from '$core/strict/types';
import type { Writable } from 'svelte/store';
import { writable } from 'svelte/store';

export type LabeledChoice = { value: any; label?: string; disabled?: true };
export type GroupedChoice = { group: string; choices: Choices };
export type Choice = LabeledChoice | GroupedChoice | string;
export type Choices = Choice[];

export type RequiredFieldState = {
  name: string;
  inputValue?: any;
  choices?: Choice[];

  clean?: CleanFunction[];
  validate?: ValidateFunction[];

  hideLabel?: boolean;
  label?: string;
  help?: string;

  required?: boolean;
};

export type FieldState = RequiredFieldState & {
  id?: string;

  value?: any;
  errors: ValidateValidReturn[];

  isValid?: boolean;
  isBlurred?: boolean;

  clean: CleanFunction[];
  validate: ValidateFunction[];

  disabled?: boolean;
  loading?: boolean;
};

export type FormState = {
  submitDisabled: boolean;
  formDisabled: boolean;
  loading: boolean;
  error: string | null;

  fields: { [name: string]: FieldState };
};
export type FormStore = Writable<FormState>;

export const createFormStore = () =>
  writable<FormState>({
    error: null,
    submitDisabled: false,
    formDisabled: false,
    loading: false,
    fields: {},
  });

/**
 * We only run cleaning process if it returns non-undefined value.
 * If it does, we consider the value not required and therefore omit all the following
 * operations.
 */
export const getCleanedValue = (field: FieldState) => {
    let firstRun = true;
    return field.clean.reduce((acc, curr) => {
      if (firstRun) {
        firstRun = false;
        return curr(acc);
      }
      return typeof acc === 'undefined' ? acc : curr(acc);
    }, field.inputValue);
  },
  setCleanedValue = (store: FormStore, field: FieldState) =>
    store.update($state => {
      $state.error = null;
      $state.fields[field.name].value = getCleanedValue(field);
      return $state;
    }),
  /**
   * We only run validation for required values. If cleaning process returned `undefined`,
   * we consider this value as optional, therefore validation is omitted.
   */
  getErrors = (value: any, validateFns: ValidateFunction[]) =>
    typeof value === 'undefined'
      ? []
      : (validateFns.map(fn => fn(value)).filter(Boolean) as ValidateValidReturn[]),
  setErrors = (formState: FormState, fieldname: string, errors: ValidateValidReturn[]) => {
    const f = formState.fields[fieldname];
    f.errors = errors;
    f.isValid = errors.length === 0;
    return formState;
  },
  runValidation = (formStore: FormStore, field: FieldState) => {
    const errors = getErrors(field.value, field.validate);
    formStore.update($state => setErrors($state, field.name, errors));
  },
  getValueFromChoisesRecursively = (choice?: Choice | null): string | null => {
    let needToSet: string | null;
    if (!choice) needToSet = null;
    else if (typeof choice == 'string') needToSet = choice;
    else if ('group' in choice) needToSet = getValueFromChoisesRecursively(choice.choices[0]);
    else needToSet = choice.value;
    return needToSet;
  };
