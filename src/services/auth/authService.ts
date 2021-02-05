import { get } from 'svelte/store';

import { request } from '@/services/request';
import { TokenState, tokenStore, resetTokenStore } from '@/stores/token';
import { UserEncrState, userEncrStore, resetUserStore } from '@/stores/user';
import { resetWalletStores } from '@/stores/wallet';
import { resetEncryptedStore } from '@/stores/encr/store';
import { resetEncryptionKeysState } from '@/stores/encr/keysState';

export enum InviteStringTypes {
  service = 'service',
  wallet = 'wallet',
}
export enum InvitePurpose {
  signup = 'signup',
  walletJoin = 'walletJoin',
}

type ServiceInvitePayload = { userInviterId: string; inviteId: string };
type WalletInviteObject = ServiceInvitePayload & {
  walletId: string;
};
type InvitePayload =
  | {
      type: InviteStringTypes.service;
      payload: ServiceInvitePayload;
    }
  | {
      type: InviteStringTypes.wallet;
      payload: WalletInviteObject;
    };

export class AuthService {
  private static prefix = '/auth/';

  static async signIn(data: { usernameOrEmail: string; password: string }) {
    const { user, ...tokens } = (
      await request<{ user: UserEncrState } & TokenState>({
        method: 'POST',
        path: `${this.prefix}signin`,
        data,
      })
    ).json;

    tokenStore.set(tokens);
    userEncrStore.set(user);
  }

  static async signUp(data: {
    username: string;
    password: string;
    email?: string;
    invite?: string;
  }) {
    const { user, isWalletInvite, ...tokens } = (
      await request<{ user: UserEncrState; isWalletInvite: boolean } & TokenState>({
        method: 'POST',
        path: `${this.prefix}signup`,
        data,
      })
    ).json;

    tokenStore.set(tokens);
    userEncrStore.set(user);

    return { isWalletInvite };
  }

  static isInviteValid(invite: string, purpose?: InvitePurpose) {
    return request<InvitePayload>({
      method: 'POST',
      path: `${this.prefix}invite/isValid`,
      data: { invite, purpose },
    });
  }

  static resetPasswordRequest(email: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}requestPasswordReset`,
      data: { email },
    });
  }

  static isResetPasswordTokenValid(token: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}isResetTokenValid`,
      data: { token },
    });
  }

  static async setPasswordFromToken(data: { token: string; password: string }) {
    return request({
      method: 'POST',
      path: `${this.prefix}setPasswordFromResetToken`,
      data,
    });
  }

  static validateEmail(emailToken: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}validateEmail/${emailToken}`,
    });
  }

  static changePassword(data: { oldPassword: string; newPassword: string }) {
    return request({
      method: 'POST',
      path: `${this.prefix}changePassword`,
      data,
    });
  }

  static async updateUsername(username: string) {
    const user = (
      await request<UserEncrState>({
        method: 'POST',
        path: `${this.prefix}updateUsername`,
        data: { username },
      })
    ).json;

    userEncrStore.set(user);
  }

  static updateEmail(email: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}updateEmail`,
      data: { email },
    });
  }

  static async updateIsSubscribed(isSubscribed: boolean) {
    const user = (
      await request<UserEncrState>({
        method: 'POST',
        path: `${this.prefix}updateIsSubscribed`,
        data: { isSubscribed },
      })
    ).json;

    userEncrStore.set(user);
  }

  static async setMasterPassword(data: {
    b64salt: string;
    b64InvitePublicKey: string;
    b64EncryptedInvitePrivateKey: string;
    chests: { walletId: string; chest: string }[];
  }) {
    const user = (
      await request<UserEncrState>({
        method: 'POST',
        path: `${this.prefix}updateMasterPassword`,
        data,
      })
    ).json;

    userEncrStore.set(user);
  }

  static async unsubscribe(unsubscribeToken: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}unsubscribe/${unsubscribeToken}`,
    });
  }

  static async logout() {
    const tokens = get(tokenStore) as StoreValue<typeof tokenStore>,
      { refreshToken } = tokens!;

    await request<UserEncrState>({
      method: 'POST',
      path: `${this.prefix}logout`,
      data: { refreshToken },
    });

    resetEncryptionKeysState();

    resetTokenStore();
    resetUserStore();
    resetWalletStores();
    resetEncryptedStore();
  }
}
