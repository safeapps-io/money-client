import { derived, writable } from 'svelte/store';

export type VisitPages = 'dashboard';

export const visitCounterStoreKey = 'visitCounterStore',
  visitCounterStore = writable<{ [key in VisitPages]?: number }>({});

export const addVisit = (key: VisitPages) =>
    visitCounterStore.update($state => {
      $state[key] = ($state[key] || 0) + 1;
      return $state;
    }),
  getPageStats = derived(visitCounterStore, $state => (key: VisitPages) => $state[key] || 0);
