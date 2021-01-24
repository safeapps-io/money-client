import { Readable } from 'svelte/store';

export {};

declare global {
  type BooleanCheck<T> = Exclude<T, false | null | undefined | '' | 0>;
  type ThenArg<T> = T extends PromiseLike<infer U> ? U : T;
  type ArrayItem<T> = T extends Array<infer U> ? U : T;
  type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  type StoreValue<T> = T extends Readable<infer U> ? U : T;
  type Action<T = void, N = HTMLElement> = (
    node: N,
    params: T,
  ) => { update?: (params: T) => void; destroy?: () => void } | void;
}
