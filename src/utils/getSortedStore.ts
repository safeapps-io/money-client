import { Readable, Writable, derived } from 'svelte/store';
import emojiRegex from 'emoji-regex';

type InputStore<T> = Writable<{ [id: string]: T }> | Readable<{ [id: string]: T }>;

/**
 * Sorts input keyed store with a custom cmp function.
 */
export const getSortedStore = <T>(store: InputStore<T>, cmpFn: (ent1: T, ent2: T) => number) =>
  derived(store, $state => Object.values($state).sort(cmpFn));

/**
 * Sorts input keyed store by property `title` ignoring starting emoji and locale differences.
 */
const r = emojiRegex();
export const stripEmoji = (data: string) => data.replace(r, '').trim();

export const getSortedByTitleStore = <T extends Object>(
  store: InputStore<T>,
  textGetter: (ent: T) => string,
) =>
  getSortedStore(store, (ent1, ent2) =>
    stripEmoji(textGetter(ent1)).localeCompare(stripEmoji(textGetter(ent2))),
  );
