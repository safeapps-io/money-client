import { nanoid } from 'nanoid';
import { get } from 'svelte/store';

import { getEmojiHash } from '$utils/hashEmoji';

import { invitationSignatureService, encryptionService } from '$services/crypto/cryptoService';
import { WalletService } from '$services/wallet/walletService';
import { gotoInviteFullPath } from '$core/routes';
import { walletStore } from '$stores/wallet';
import { post, request } from '$services/request';

export type WalletInviteObject = {
  userId: string;
  inviteId: string;
  walletId: string;
};

export class InviteService {
  static inviteJoinPathPrefix = '/invite/join';

  static async generateServiceInvite(userId: string) {
    const res = await invitationSignatureService.sign({
      inviteId: nanoid(),
      userInviterId: userId,
    });
    return gotoInviteFullPath(btoa(res.encoded));
  }

  static async generateWalletInvite(data: { walletId: string; userId: string }) {
    const res = await invitationSignatureService.sign({
      inviteId: nanoid(),
      walletId: data.walletId,
      userInviterId: data.userId,
    });
    return gotoInviteFullPath(btoa(res.encoded));
  }

  static async launchWalletJoin(inviteString: string) {
    await invitationSignatureService.generateEcdhKey();

    const [{ encoded }, ecdhPublicKeyHash] = await Promise.all([
      invitationSignatureService.sign(inviteString),
      getEmojiHash(invitationSignatureService.ecdhKeyPair.b64publicKey),
    ]);

    const data = {
      b64InviteSignatureByJoiningUser: encoded,
      b64PublicECDHKey: invitationSignatureService.ecdhKeyPair.b64publicKey,

      ecdhPublicKeyHash,
    };

    await request({
      method: post,
      path: `${this.inviteJoinPathPrefix}/validate/request`,
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
        invitationSignatureService.verify<WalletInviteObject>(b64InviteString),
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
    const path = `${this.inviteJoinPathPrefix}/validate/result`;
    if ('isValid' in data || !data.allowJoin) {
      return request({ method: post, path, data });
    } else {
      await invitationSignatureService.generateEcdhKey();
      const [derivedKey, walletKey] = await Promise.all([
        invitationSignatureService.deriveEncryptionKeyFromEcdh(data.b64PublicECDHKey),
        encryptionService.getSecretKeyFromChest(data.walletChest),
      ]);

      return request({
        path,
        method: post,
        data: {
          ...data,
          b64PublicECDHKey: invitationSignatureService.ecdhKeyPair.b64publicKey,
          encryptedSecretKey: await encryptionService.wrapKey({
            wrappingKey: derivedKey,
            keyToWrap: walletKey,
          }),
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
    const wrappingKey = await invitationSignatureService.deriveEncryptionKeyFromEcdh(
        b64PublicECDHKey,
      ),
      walletKey = await encryptionService.unwrapKey({
        wrappedKey: encryptedSecretKey,
        wrappingKey,
      }),
      chest = await encryptionService.getChest(walletKey);

    try {
      await WalletService.joinWallet(walletId, chest);
    } catch (error) {
      await request({
        method: post,
        path: `${this.inviteJoinPathPrefix}/fail`,
        data: { b64InviteString },
      });
      throw error;
    }
  }
}
