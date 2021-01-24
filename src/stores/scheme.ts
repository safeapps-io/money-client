import { SimpleScheme } from '@/core/csv/types';
import { derived, writable } from 'svelte/store';
import { userDecrStore } from './decr/user';

export const schemeCacheKey = 'scheme',
  schemeStore = writable<{ [id: string]: SimpleScheme }>({});

export const allLocalSchemes = derived([schemeStore, userDecrStore], ([$scheme, $user]) => {
  if (!$user) return [];

  return [...Object.values($scheme), ...($user.decr.schemes || [])];
});
