import { writable } from 'svelte/store';

export const mccCacheKey = 'mcc',
  mccStore = writable<{ [code: string]: string | null }>({});

export const updateMccDescriptions = (
  descriptions: { code: string; description: string | null }[],
) => {
  mccStore.update($state =>
    descriptions.reduce((acc, { code, description }) => ((acc[code] = description), acc), $state),
  );
};
