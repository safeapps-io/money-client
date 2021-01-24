import { writable } from 'svelte/store';
import { resetStore } from '@/utils/persistStore';

export type TokenState = {
  refreshToken: string | null;
  accessToken: string | null;
};

export const tokenCacheKey = 'token',
  tokenStore = writable<TokenState | null>(null);

export const resetTokenStore = () => resetStore(tokenStore),
  setAccessToken = (newToken: string) => {
    tokenStore.update(state => ({
      ...state!,
      accessToken: newToken,
    }));
  };
