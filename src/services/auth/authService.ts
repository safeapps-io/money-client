import { request } from '$services/request';
import type { UserEncrState, RefreshToken } from '$stores/user';
import { userEncrStore } from '$stores/user';
import { dropUserData } from './dropUserData';

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
    const { user } = (
      await request<{ user: UserEncrState }>({
        method: 'POST',
        path: `${this.prefix}signin`,
        data,
      })
    ).json;

    userEncrStore.set(user);
  }

  static async signUp(data: {
    username: string;
    password: string;
    email?: string;
    invite?: string;
  }) {
    const { user, isWalletInvite } = (
      await request<{ user: UserEncrState; isWalletInvite: boolean }>({
        method: 'POST',
        path: `${this.prefix}signup`,
        data,
      })
    ).json;

    userEncrStore.set(user);

    return { isWalletInvite };
  }

  static async getWsTicket() {
    const { ticket } = (
      await request<{ ticket: string }>({
        method: 'POST',
        path: `${this.prefix}user/wsTicket`,
      })
    ).json;

    return ticket;
  }

  static async isUserStillValid() {
    try {
      await request<UserEncrState>({
        path: `${this.prefix}user`,
      });
      return true;
    } catch (e) {
      dropUserData();
      return false;
    }
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

  static async getSessions() {
    return (
      await request<RefreshToken[]>({
        path: `${this.prefix}user/sessions`,
      })
    ).json;
  }

  static async dropSessions(ids: string[]) {
    return (
      await request<RefreshToken[]>({
        method: 'DELETE',
        path: `${this.prefix}user/sessions`,
        data: { ids },
      })
    ).json;
  }

  static async unsubscribe(unsubscribeToken: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}unsubscribe/${unsubscribeToken}`,
    });
  }

  static async dropUser(password: string) {
    await request<{}>({
      method: 'DELETE',
      path: `${this.prefix}user`,
      data: { password },
    });
    dropUserData();
  }

  static async logout() {
    await request<UserEncrState>({
      method: 'POST',
      path: `${this.prefix}logout`,
    });

    dropUserData();
  }
}
