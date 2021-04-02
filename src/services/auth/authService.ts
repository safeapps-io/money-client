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
        path: `${this.prefix}user/wsTicket`,
      })
    ).json;

    return ticket;
  }

  static async isUserStillValid() {
    try {
      const res = await request<{ user: UserEncrState; plan: any }>({
        path: `${this.prefix}user`,
      });
      userEncrStore.set(res.json.user);

      return true;
    } catch (e) {
      dropUserData();
      return false;
    }
  }

  static isInviteValid(invite: string) {
    return request<InvitePayload>({
      method: 'POST',
      path: `${this.prefix}invite/is-valid/${invite}`,
    });
  }

  static resetPasswordRequest(email: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}reset-password/request`,
      data: { email },
    });
  }

  static isResetPasswordTokenValid(token: string) {
    return request({
      path: `${this.prefix}reset-password/${token}`,
    });
  }

  static async setPasswordFromToken({ token, password }: { token: string; password: string }) {
    return request({
      method: 'POST',
      path: `${this.prefix}reset-password/${token}`,
      data: { password },
    });
  }

  static validateEmail(emailToken: string) {
    return request({
      method: 'POST',
      path: `${this.prefix}validate-email/${emailToken}`,
    });
  }

  static changePassword(data: { oldPassword: string; newPassword: string }) {
    return request({
      method: 'POST',
      path: `${this.prefix}user/password`,
      data,
    });
  }

  static async updateUser(data: { username?: string; email?: string; isSubscribed?: boolean }) {
    const res = await request<UserEncrState>({ method: 'PATCH', path: `${this.prefix}user`, data });

    userEncrStore.set(res.json);
    return res.json;
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
        path: `${this.prefix}user/password/master`,
        data,
      })
    ).json;

    userEncrStore.set(user);
  }

  static async getSessions() {
    return (
      await request<RefreshToken[]>({
        path: `${this.prefix}user/session`,
      })
    ).json;
  }

  static async dropSessions(ids: string[]) {
    return (
      await request<RefreshToken[]>({
        method: 'DELETE',
        path: `${this.prefix}user/session`,
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
      path: `${this.prefix}/user/session/logout`,
    });

    dropUserData();
  }
}
