import { writable } from 'svelte/store';

export enum SyncStatuses {
  initial = 'i',
  runs = 'r',
  finished = 'f',
}

export const syncStatusStore = writable<SyncStatuses>(SyncStatuses.initial);
