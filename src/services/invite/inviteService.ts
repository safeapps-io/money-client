import { nanoid } from 'nanoid';
import { get } from 'svelte/store';

import { getEmojiHash } from '$utils/hashEmoji';

import { invitationSignatureService, encryptionService } from '$services/crypto/cryptoService';
import { WalletService } from '$services/wallet/walletService';
import { gotoInviteFullPath } from '$core/routes';
import type { Wallet } from '$stores/wallet';
import { walletStore } from '$stores/wallet';

export type WalletInviteObject = {
  userId: string;
  inviteId: string;
  walletId: string;
};

export class InviteService {
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

  static async joiningInitial(inviteString: string) {
    await invitationSignatureService.generateEcdhKey();

    const [{ encoded }, ecdhPublicKeyHash] = await Promise.all([
      invitationSignatureService.sign(inviteString),
      getEmojiHash(invitationSignatureService.ecdhKeyPair.b64publicKey),
    ]);

    return {
      b64InviteSignatureByJoiningUser: encoded,
      b64PublicECDHKey: invitationSignatureService.ecdhKeyPair.b64publicKey,

      ecdhPublicKeyHash,
    };
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
      wallet = (get(walletStore) as StoreValue<typeof walletStore>)?.[data?.walletId] as
        | Wallet
        | undefined;

    if (!wallet || !isValid || wallet.users.find(u => u.WalletAccess.inviteId == data.inviteId))
      throw new Error();

    return { hash, wallet };
  }

  static async ownerAllowJoin({
    b64PublicECDHKey,
    walletChest,
  }: {
    b64PublicECDHKey: string;
    walletChest: string;
  }) {
    await invitationSignatureService.generateEcdhKey();
    const [derivedKey, walletKey] = await Promise.all([
      invitationSignatureService.deriveEncryptionKeyFromEcdh(b64PublicECDHKey),
      encryptionService.getSecretKeyFromChest(walletChest),
    ]);
    return {
      b64PublicECDHKey: invitationSignatureService.ecdhKeyPair.b64publicKey,
      encryptedSecretKey: await encryptionService.wrapKey({
        wrappingKey: derivedKey,
        keyToWrap: walletKey,
      }),
    };
  }

  static async joiningFinal({
    encryptedSecretKey,
    b64PublicECDHKey,

    walletId,
  }: {
    encryptedSecretKey: string;
    b64PublicECDHKey: string;

    walletId: string;
  }) {
    const wrappingKey = await invitationSignatureService.deriveEncryptionKeyFromEcdh(
        b64PublicECDHKey,
      ),
      walletKey = await encryptionService.unwrapKey({
        wrappedKey: encryptedSecretKey,
        wrappingKey,
      }),
      chest = await encryptionService.getChest(walletKey);

    return WalletService.joinWallet(walletId, chest);
  }
}
