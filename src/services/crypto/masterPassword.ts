import { AuthService } from '@/services/auth/authService';
import { keyWrappedWithPinStore, updateKeyData } from '@/stores/user';
import { updateChests } from '@/stores/wallet';
import { encryptionKeySet } from '@/stores/encr/keysState';
import { encryptionService, invitationSignatureService } from './cryptoService';

export const setNewMasterPassword = async ({
  masterPassword,
  currentChests,
  userId,
}: {
  masterPassword: string;
  userId: string;
  currentChests: { walletId: string; chest: string }[];
}) => {
  const oldSalt = encryptionService.salt,
    oldEncryptionKey = encryptionService.encryptionKey,
    oldInvitationKeyPair = invitationSignatureService.invitationKeyPair;

  try {
    const b64salt = encryptionService.generateSalt(),
      // Getting secret keys in exportable way before we change the encryptionKey
      walletSecretKeys = await Promise.all(
        currentChests.map(({ chest }) => encryptionService.getSecretKeyFromChest(chest)),
      );

    await Promise.all([
      encryptionService.setEncryptionKeyFromInput(masterPassword),
      invitationSignatureService.generateInviteKey(),
    ]);
    const keyPair = await invitationSignatureService.getServerReadyDataFromKeyPair(
      encryptionService.encryptionKey,
    );

    const chestsArr = await Promise.all(
        walletSecretKeys.map(key => encryptionService.getChest(key)),
      ),
      chests = chestsArr.map((chest, index) => ({
        chest,
        walletId: currentChests![index].walletId,
      }));

    await AuthService.setMasterPassword({ ...keyPair, b64salt, chests });

    // Resetting pin when setting new master-password
    keyWrappedWithPinStore.set(null);

    updateKeyData({ b64salt, ...keyPair });
    updateChests(userId, chests);

    // We need to set it in true, because a user can set his password in the first session,
    // when no encryption key was set earlier.
    encryptionKeySet(true);
  } catch (error) {
    // Reverting all the crypto keys and salts back to its original state.
    encryptionService.salt = oldSalt;
    encryptionService.encryptionKey = oldEncryptionKey;

    invitationSignatureService.invitationKeyPair = oldInvitationKeyPair;

    throw new Error(error);
  }
};

const afterEncryptionKeySet = async (inviteKeys: {
  b64InvitePublicKey: string;
  b64EncryptedInvitePrivateKey: string;
}) => {
  // You can only enter it once when first logging in.
  await invitationSignatureService.getKeysFromBackendData({
    encryptionKey: encryptionService.encryptionKey,
    ...inviteKeys,
  });
  encryptionKeySet(true);
};

export const enterMasterPassword = async ({
  input,
  b64salt,
  ...inviteKeys
}: {
  input: string;
  b64salt: string;
  b64InvitePublicKey: string;
  b64EncryptedInvitePrivateKey: string;
}) => {
  encryptionService.setSalt(b64salt);

  await encryptionService.setEncryptionKeyFromInput(input);
  await afterEncryptionKeySet(inviteKeys);
};

export const setPinCode = async (pinCode: string) => {
  const wrapped = await encryptionService.wrapKey({ pinCode });
  keyWrappedWithPinStore.set(wrapped);
};

export const enterPinCode = async ({
  pinCode,
  wrappedKey,
  b64salt,
  ...inviteKeys
}: {
  pinCode: string;
  wrappedKey: string;
  b64salt: string;
  b64InvitePublicKey: string;
  b64EncryptedInvitePrivateKey: string;
}) => {
  encryptionService.setSalt(b64salt);
  await encryptionService.unwrapKey({ pinCode, wrappedKey });
  await afterEncryptionKeySet(inviteKeys);
};
