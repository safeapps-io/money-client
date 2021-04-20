import { nanoid } from 'nanoid';
import { get } from 'svelte/store';

import { getEmojiHash } from '$utils/hashEmoji';

import { WalletService } from '$services/wallet/walletService';
import { gotoInviteFullPath } from '$core/routes';
import { walletStore } from '$stores/wallet';
import { post, request } from '$services/request';
import {
  deriveKeyFromPublicEcdh,
  generateChest,
  getEcdhPublicKey,
  getWalletKeyFromChest,
  sign,
  verify,
} from '$services/crypto/keys';
import { unwrapKey, wrapKey } from '$utils/crypto/encryption';

export enum InviteStringTypes {
  service = 'service',
  wallet = 'wallet',
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

export class InviteService {
  static prefix = '/auth/invite';

  static async generateServiceInvite(userId: string) {
    const res = await sign({
      inviteId: nanoid(),
      userInviterId: userId,
    });
    return gotoInviteFullPath(btoa(res.encoded));
  }

  static async generateWalletInvite(data: { walletId: string; userId: string }) {
    const res = await sign({
      inviteId: nanoid(),
      walletId: data.walletId,
      userInviterId: data.userId,
    });
    return gotoInviteFullPath(btoa(res.encoded));
  }

  static isInviteValid(invite: string) {
    return request<InvitePayload>({
      method: post,
      path: `${this.prefix}/is-valid`,
      data: { invite },
    });
  }

  static async launchWalletJoin(inviteString: string) {
    const publicEcdhKey = await getEcdhPublicKey();

    const [{ encoded }, ecdhPublicKeyHash] = await Promise.all([
      sign(inviteString),
      getEmojiHash(publicEcdhKey),
    ]);

    const data = {
      b64InviteSignatureByJoiningUser: encoded,
      b64PublicECDHKey: publicEcdhKey,
      b64InviteString: inviteString,
    };

    await request({
      method: post,
      path: `${this.prefix}/validate/request`,
      data,
    });

    return ecdhPublicKeyHash;
  }

  static async ownerValidateInitialRequest({
    b64InviteString,
    b64PublicECDHKey,
  }: {
    b64InviteString: string;
    b64PublicECDHKey: string;
  }) {
    const [{ data, isValid }, hash] = await Promise.all([
        verify<WalletInviteObject>(b64InviteString),
        getEmojiHash(b64PublicECDHKey),
      ]),
      wallet = get(walletStore)?.[data?.walletId];

    if (!wallet || !isValid || wallet.users.find(u => u.WalletAccess.inviteId == data.inviteId))
      throw new Error();

    return { hash, wallet };
  }

  static async ownerResolution(
    data: {
      joiningUserId: string;
      b64InviteSignatureByJoiningUser: string;
      b64InviteString: string;
    } & (
      | { isValid: false }
      | { allowJoin: false }
      | { allowJoin: true; b64PublicECDHKey: string; walletChest: string }
    ),
  ) {
    const path = `${this.prefix}/validate/result`;
    if ('isValid' in data || !data.allowJoin) {
      return request({ method: post, path, data });
    } else {
      const ecdhPublicKey = await getEcdhPublicKey(),
        [derivedKey, walletKey] = await Promise.all([
          deriveKeyFromPublicEcdh(data.b64PublicECDHKey),
          getWalletKeyFromChest(data.walletChest),
        ]);

      return request({
        path,
        method: post,
        data: {
          ...data,
          b64PublicECDHKey: ecdhPublicKey,
          encryptedSecretKey: await wrapKey(walletKey, derivedKey),
        },
      });
    }
  }

  static async joiningFinal({
    encryptedSecretKey,
    b64PublicECDHKey,
    walletId,

    b64InviteString,
  }: {
    encryptedSecretKey: string;
    b64PublicECDHKey: string;
    walletId: string;

    b64InviteString: string;
  }) {
    const wrappingKey = await deriveKeyFromPublicEcdh(b64PublicECDHKey),
      walletKey = await unwrapKey(encryptedSecretKey, wrappingKey),
      chest = await generateChest(walletKey);

    try {
      await WalletService.joinWallet(walletId, chest);
    } catch (error) {
      await request({
        method: post,
        path: `${this.prefix}/fail`,
        data: { b64InviteString },
      });
      throw error;
    }
  }
}
