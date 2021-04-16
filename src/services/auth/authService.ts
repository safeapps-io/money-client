import { get } from 'svelte/store';

import { enterMasterPassword, getNewMasterPasswordData } from '$services/crypto/keys';
import { del, patch, post, request } from '$services/request';
import { walletEvents } from '$services/wallet/walletEvents';
import type { PlanPartial } from '$stores/billing';
import { plansStore } from '$stores/billing';
import type { userDecrStore } from '$stores/decr/user';
import type { UserEncrState, RefreshToken } from '$stores/user';
import { updateKeyData } from '$stores/user';
import { userEncrStore } from '$stores/user';
import { updateChests } from '$stores/wallet';
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
type UserFullData = UserEncrState & { plans: PlanPartial[] };

export class AuthService {
  private static prefix = '/auth/';

  static async signIn(data: { usernameOrEmail: string; password: string }) {
    const res = await request<UserEncrState>({
      method: post,
      path: `${this.prefix}signin`,
      data,
    });

    userEncrStore.set(res.json);
  }

  static async signUp(data: {
    username: string;
    password: string;
    email?: string;
    invite?: string;
  }) {
    const { user, isWalletInvite } = (
      await request<{ user: UserEncrState; isWalletInvite: boolean }>({
        method: post,
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

  private static getUserAndPlan(data: UserFullData) {
    const { plans, ...user } = data;
    return { plans, user };
  }

  static async isUserStillValid() {
    try {
      const res = await request<UserFullData>({
          path: `${this.prefix}user`,
        }),
        { plans, user } = this.getUserAndPlan(res.json);

      userEncrStore.set(user);
      plansStore.set(plans);

      return true;
    } catch (e) {
      dropUserData();
      return false;
    }
  }

  static isInviteValid(invite: string) {
    return request<InvitePayload>({
      method: post,
      path: `${this.prefix}invite/is-valid/${invite}`,
    });
  }

  static resetPasswordRequest(email: string) {
    return request({
      method: post,
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
      method: post,
      path: `${this.prefix}reset-password/${token}`,
      data: { password },
    });
  }

  static validateEmail(emailToken: string) {
    return request({
      method: post,
      path: `${this.prefix}validate-email/${emailToken}`,
    });
  }

  static changePassword(data: { oldPassword: string; newPassword: string }) {
    return request({
      method: post,
      path: `${this.prefix}user/password`,
      data,
    });
  }

  static async updateUser(
    data:
      | { username: string }
      | { email: string }
      | { isSubscribed: boolean }
      | { encr: string; clientUpdated: number; clientId: string },
  ) {
    const res = await request<UserFullData>({
        method: patch,
        path: `${this.prefix}user`,
        data,
      }),
      { user } = this.getUserAndPlan(res.json);

    userEncrStore.set(user);
    return user;
  }

  static async setMasterPassword(
    masterPassword: string,
    currentChests: { walletId: string; chest: string }[],
    userDecrState: StoreValue<typeof userDecrStore>,
  ) {
    try {
      const { keyPair, newUserEncrState, b64salt, chests } = await getNewMasterPasswordData(
          masterPassword,
          currentChests,
          userDecrState,
        ),
        commonData = {
          b64salt,
          encr: newUserEncrState,
          b64InvitePublicKey: keyPair.public,
          b64EncryptedInvitePrivateKey: keyPair.private,
        },
        // We need this `clientId` to prevent it from sending the events back to the same client
        clientId = get(walletEvents);

      await request({
        method: post,
        path: `${this.prefix}user/password/master`,
        data: {
          ...commonData,
          chests,
          clientId,
        },
      });

      await enterMasterPassword({ input: masterPassword, ...commonData });
      updateKeyData(commonData);
      /**
       * If there's no `userDecrState`, there can't be any chests definitely.
       * This user just signed up.
       */
      if (userDecrState) updateChests(userDecrState.id, chests);
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  static async getSessions() {
    return (
      await request<RefreshToken[]>({
        path: `${this.prefix}user/session`,
      })
    ).json;
  }

  static async dropSessions(id?: string) {
    return (
      await request<RefreshToken[]>({
        method: del,
        path: `${this.prefix}user/session`,
        data: { id },
      })
    ).json;
  }

  static async unsubscribe(unsubscribeToken: string) {
    return request({
      method: post,
      path: `${this.prefix}unsubscribe/${unsubscribeToken}`,
    });
  }

  static async dropUser(password: string) {
    await request({
      method: del,
      path: `${this.prefix}user`,
      data: { password },
    });
    dropUserData();
  }

  static async logout() {
    await request<UserEncrState>({
      method: post,
      path: `${this.prefix}/user/session/logout`,
    });

    dropUserData();
  }
}
