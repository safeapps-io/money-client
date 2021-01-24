import { Writable } from 'svelte/store';
import { Store, get, set, del } from 'idb-keyval';

// Singleton, lol
const indexedDbStore = process.env.BROWSER ? new Store('saviour', 'main') : undefined;

/**
 * Automatically caches arbitrary store to IndexedDB on every change.
 * It returns Promise by design. We do not want to have a state in which we need to adapt interface to
 * unloaded data.
 *
 * IndexedDb returns null for non-existing keys by default, so even after store initialization process
 * you need to be careful about store value. Describe the store as `S | null` whenever it's possible.
 */
export const persistStore = async <S>(cacheKey: string, store: Writable<S>) => {
    if (process.env.BROWSER) {
      try {
        const res = await get<S | null>(cacheKey, indexedDbStore);
        if (res) store.set(res);
      } catch (error) {
        del(cacheKey, indexedDbStore).catch(() => {});
      }

      return store.subscribe($state => {
        if ($state) set(cacheKey, $state, indexedDbStore).catch(console.error);
        else del(cacheKey, indexedDbStore).catch(() => {});
      });
    }
  },
  resetStore = <S>(store: Writable<S | null>) => store.set(null);

/**
 * Essentially the same thing as `persistStore`, but uses LocalStorage for this purpose. Has a simpler design,
 * since LS is blocking.
 */
export const persistStoreLs = <S>(cacheKey: string, store: Writable<S>) => {
  if (process.env.BROWSER) {
    const cached = localStorage.getItem(cacheKey);
    if (cached) store.set(JSON.parse(cached) as S);

    return store.subscribe($state => {
      if ($state) localStorage.setItem(cacheKey, JSON.stringify($state));
      else localStorage.removeItem(cacheKey);
    });
  }
};
