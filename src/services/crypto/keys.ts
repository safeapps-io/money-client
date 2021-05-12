import { decode, encode } from 'base64-arraybuffer-es6';

import {
  deriveKeyFromInput,
  generateSalt,
  unwrapKey,
  utilDecrypt,
  utilEncrypt,
  wrapKey,
} from '$utils/crypto/encryption';
import {
  deriveEncryptionKeyFromEcdh,
  generateEcdhKey,
  generateInviteKeys,
  unwrapKeyPair,
  utilSign,
  utilVerify,
  wrapKeyPair,
} from '$utils/crypto/invite';
import { deriveAlgo } from '$utils/crypto/common';
import { stringToBuffer } from '$utils/buffer/conversions';

import { keyWrappedWithPinStore } from '$stores/user';
import { encryptionKeySet } from '$stores/encr/keysState';
import type { userDecrStore } from '$stores/decr/user';

let salt: ArrayBuffer | null = null,
  encryptionKey: CryptoKey | null = null,
  walletKeys: { [walletId: string]: CryptoKey } = {};

let invitationKeyPair: {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
  } | null = null,
  ecdhPrivateKey: CryptoKey | null = null;

export const setStartStateForKeys = () => {
  salt = encryptionKey = invitationKeyPair = ecdhPrivateKey = null;
  walletKeys = {};
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
  salt = decode(b64salt);
  encryptionKey = await deriveKeyFromInput(salt, stringToBuffer(input), deriveAlgo.iterations);

  await afterEncryptionKeySet(inviteKeys);
};

const afterEncryptionKeySet = async (inviteKeys: {
  b64InvitePublicKey: string;
  b64EncryptedInvitePrivateKey: string;
}) => {
  assertValue(encryptionKey);

  invitationKeyPair = await unwrapKeyPair(
    inviteKeys.b64InvitePublicKey,
    inviteKeys.b64EncryptedInvitePrivateKey,
    encryptionKey,
  );
  encryptionKeySet(true);
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
  salt = decode(b64salt);
  const keyFromPin = await deriveKeyFromInput(
    salt,
    stringToBuffer(pinCode),
    deriveAlgo.pinIterations,
  );
  encryptionKey = await unwrapKey(wrappedKey, keyFromPin);
  await afterEncryptionKeySet(inviteKeys);
};

export const setPinCode = async (pinCode: string) => {
  assertValue(salt);
  assertValue(encryptionKey);

  const keyFromPin = await deriveKeyFromInput(
    salt,
    stringToBuffer(pinCode),
    deriveAlgo.pinIterations,
  );
  keyWrappedWithPinStore.set(await wrapKey(encryptionKey, keyFromPin));
};

export const getNewMasterPasswordData = async (
  masterPassword: string,
  currentChests: { walletId: string; chest: string }[],
  userDecrState: StoreValue<typeof userDecrStore>,
) => {
  const { salt, b64salt } = generateSalt(),
    // Getting secret keys in exportable way before we change the encryptionKey
    walletSecretKeys = await Promise.all(
      currentChests.map(({ chest }) => getWalletKeyFromChest(chest)),
    );

  const [newEncryptionKey, newInviteKeys] = await Promise.all([
      deriveKeyFromInput(salt, stringToBuffer(masterPassword), deriveAlgo.iterations),
      generateInviteKeys(),
    ]),
    wrappedKeyPair = await wrapKeyPair(newInviteKeys, newEncryptionKey);

  // Getting new chests
  const chestsArr = await Promise.all(
      walletSecretKeys.map(walletKey => wrapKey(walletKey, newEncryptionKey)),
    ),
    chests = chestsArr.map((chest, index) => ({
      chest,
      walletId: currentChests[index].walletId,
    }));

  // Getting new `user.encr` state. If can be `null` for new users.
  const newUserEncrState = userDecrState
    ? encode(await utilEncrypt(newEncryptionKey, userDecrState.decr, userDecrState.id, b64salt))
    : null;

  // Resetting pin when setting new master-password
  keyWrappedWithPinStore.set(null);

  return {
    b64salt,
    chests,
    newUserEncrState,
    keyPair: wrappedKeyPair,
  };
};

export const encrypt = (data: any, id: string, additionalData: string, walletId?: string) =>
    utilEncrypt(walletId ? walletKeys[walletId] : encryptionKey!, data, id, additionalData),
  decrypt = <T>(b64data: string, id: string, additionalData: string, walletId?: string) =>
    utilDecrypt<T>(walletId ? walletKeys[walletId] : encryptionKey!, b64data, id, additionalData),
  sign = (data: string | Object) => utilSign(invitationKeyPair!.privateKey, data),
  verify = <T = string>(encoded: string) => utilVerify<T>(invitationKeyPair!.publicKey, encoded);

export const generateChest = async (key: CryptoKey) => {
    assertValue(encryptionKey);
    return wrapKey(key, encryptionKey);
  },
  setWalletKeyFromChest = async (chest: string, walletId: string) => {
    assertValue(encryptionKey);
    walletKeys[walletId] = await unwrapKey(chest, encryptionKey, false, ['encrypt', 'decrypt']);
  },
  getWalletKeyFromChest = async (chest: string) => {
    assertValue(encryptionKey);
    return unwrapKey(chest, encryptionKey);
  },
  removeWalletKey = (walletId: string) => {
    delete walletKeys[walletId];
  };

export const getEcdhPublicKey = async () => {
    const keyPair = await generateEcdhKey();
    ecdhPrivateKey = keyPair.private;
    return keyPair.public;
  },
  deriveKeyFromPublicEcdh = (publicKey: string) => {
    assertValue(ecdhPrivateKey);
    return deriveEncryptionKeyFromEcdh(ecdhPrivateKey, publicKey);
  };

function assertValue(data: any | null): asserts data {
  if (!data) throw new Error();
}
