import { writable } from 'svelte/store';

import { resetStore } from '$utils/persistStore';

type BaseUserState = {
  id: string;
  created: number;
  updated: number;

  isAdmin?: boolean;
  isSubscribed?: boolean;

  clientUpdated?: number;

  username: string;
  email: string | null;
  inviterId: string | null;
  inviteMonthlyLimit: number | null;

  b64InvitePublicKey: string | null;
  b64EncryptedInvitePrivateKey: string | null;
  b64salt: string | null;
};

export type RefreshToken = {
  id: string;
  created: number;
  description: string;
  current: boolean;
};

export type UserEncrState = BaseUserState & {
  encr: string | null;
};
export const userCacheKey = 'user',
  userEncrStore = writable<UserEncrState | null>(null);

export const resetUserStore = () => {
    resetStore(userEncrStore);
    resetStore(keyWrappedWithPinStore);
  },
  updateKeyData = (data: {
    encr: string | null;
    b64salt: string;
    b64InvitePublicKey: string;
    b64EncryptedInvitePrivateKey: string;
  }) => userEncrStore.update($state => ({ ...$state!, ...data }));

export const keyWrappedWithPinStore = writable<string | null>(null);
