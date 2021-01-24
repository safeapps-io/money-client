import { writable } from 'svelte/store';

export const mccCacheKey = 'mcc',
  mccStore = writable<{ [code: string]: string | null } | null>(null);

export const updateMccDescriptions = (
  descriptions: { code: string; description: string | null }[],
) => {
  mccStore.update($state => {
    const s = $state || {};
    descriptions.forEach(({ code, description }) => (s[code] = description));
    return s;
  });
};
