export type CleanFunction = (value?: any) => any | undefined;

export type ValidateValidReturn =
  | string
  | { key: string; values: { [interpolate: string]: string | Date | number | undefined } };

export type ValidateFunction = (value: any) => ValidateValidReturn | undefined;
export type BuildValidateFunction<T> = (input: T) => ValidateFunction;
export type BuildValidateFunctionWithOptional<T> = (input?: T) => ValidateFunction;
