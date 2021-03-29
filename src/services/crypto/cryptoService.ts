import { encode, decode } from 'base64-arraybuffer';

import { concatArrayBuffers } from '$utils/buffer/concat';
import { stringToBuffer, bufferToString } from '$utils/buffer/conversions';

type EncodedWithIv = {
  iv: string;
  data: string;
};

const encr = { name: 'AES-GCM', length: 256 },
  derive = { name: 'PBKDF2', iterations: 150_000, pinIterations: 1_000_000 },
  hash = { name: 'SHA-512' },
  sign = { name: 'RSA-PSS', saltLength: 64 },
  agreement = { name: 'ECDH', namedCurve: 'P-384' };

const hashData = (buffer: ArrayBuffer) => crypto.subtle.digest(hash.name, buffer);

class EncryptionStatic {
  static importKey(buffer: ArrayBuffer) {
    return crypto.subtle.importKey('raw', buffer, derive.name, false, ['deriveKey', 'deriveBits']);
  }

  static getRandom(size: number) {
    return crypto.getRandomValues(new Uint8Array(size));
  }

  static ivSize = 128;
  static generateIv() {
    return this.getRandom(this.ivSize);
  }

  static encodeDataWithIv(iv: ArrayBuffer, data: ArrayBuffer) {
    const encoded: EncodedWithIv = { iv: encode(iv), data: encode(data) };
    return encode(stringToBuffer(JSON.stringify(encoded)));
  }

  static decodeDataWithIv(b64data: string) {
    const { iv, data } = JSON.parse(bufferToString(decode(b64data))) as EncodedWithIv;
    return { iv: decode(iv), data: decode(data) };
  }

  static async getDeterministicIv(id: string, additionalData: string) {
    const [buff1, buff2] = await Promise.all(
      [id, additionalData].map(stringToBuffer).map(hashData),
    );
    return concatArrayBuffers(buff1, buff2);
  }

  static generateUserB64Salt() {
    return encode(this.getRandom(256));
  }

  static async deriveKeyFromInput({
    salt,
    input,
    pin,
  }: {
    salt: ArrayBuffer;
    input: ArrayBuffer;
    pin: boolean;
  }) {
    return crypto.subtle.deriveKey(
      {
        salt,
        name: derive.name,
        hash: hash.name,
        iterations: pin ? derive.pinIterations : derive.iterations,
      },
      await this.importKey(input),
      { name: encr.name, length: encr.length },
      true,
      ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
    );
  }
}

export class EncryptionService {
  salt: ArrayBuffer;
  encryptionKey: CryptoKey;
  walletKeys: { [walletId: string]: CryptoKey };

  constructor() {
    this.walletKeys = {};
  }

  generateSalt() {
    const b64salt = EncryptionStatic.generateUserB64Salt();
    this.salt = decode(b64salt);
    return b64salt;
  }

  setSalt(b64salt: string) {
    this.salt = decode(b64salt);
  }

  async setEncryptionKeyFromInput(input: string) {
    this.encryptionKey = await EncryptionStatic.deriveKeyFromInput({
      salt: this.salt,
      input: stringToBuffer(input),
      pin: false,
    });
  }

  /**
   * Has two modes of work.
   * 1. wrap the encryption key with a pin code
   * 2. wrap any key with any other key
   */
  async wrapKey(
    data:
      | { pinCode: string }
      | {
          wrappingKey: CryptoKey;
          keyToWrap: CryptoKey;
        },
  ) {
    let keyToWrap: CryptoKey, wrappingKey: CryptoKey;
    if ('pinCode' in data) {
      keyToWrap = this.encryptionKey;
      wrappingKey = await EncryptionStatic.deriveKeyFromInput({
        input: stringToBuffer(data.pinCode),
        salt: this.salt,
        pin: true,
      });
    } else {
      keyToWrap = data.keyToWrap;
      wrappingKey = data.wrappingKey;
    }

    const iv = EncryptionStatic.generateIv(),
      wrappedKey = await crypto.subtle.wrapKey('raw', keyToWrap, wrappingKey, {
        name: encr.name,
        iv,
      });

    return EncryptionStatic.encodeDataWithIv(iv, wrappedKey);
  }

  /**
   * Has two modes of work.
   * 1. unwrap the encryption key with a pin code
   * 2. unwrap any key with any other key and return it
   */
  async unwrapKey(data: { wrappedKey: string; pinCode: string }): Promise<void>;
  async unwrapKey(data: { wrappedKey: string; wrappingKey: CryptoKey }): Promise<CryptoKey>;
  async unwrapKey(
    data:
      | { wrappedKey: string; pinCode: string }
      | {
          wrappedKey: string;
          wrappingKey: CryptoKey;
        },
  ): Promise<void | CryptoKey> {
    const { iv, data: wrappedKey } = EncryptionStatic.decodeDataWithIv(data.wrappedKey),
      wrappingKey =
        'pinCode' in data
          ? await EncryptionStatic.deriveKeyFromInput({
              salt: this.salt,
              input: stringToBuffer(data.pinCode),
              pin: true,
            })
          : data.wrappingKey,
      unwrappedKey = await crypto.subtle.unwrapKey(
        'raw',
        wrappedKey,
        wrappingKey,
        { name: encr.name, iv },
        encr.name,
        true,
        ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
      );

    if ('pinCode' in data) this.encryptionKey = unwrappedKey;
    else return unwrappedKey;
  }

  /**
   * A generic method to encrypt some data.
   * Can be used to encrypt wallet data or user data.
   *
   * @param param0.additionalData Some additional data that will be used in generating deterministic IV.
   *        For wallet data it should be wallet id.
   *        For user data it should be user's salt.
   */
  async encrypt({
    data,
    id,
    additionalData,

    walletId,
  }: {
    data: Object;
    id: string;
    additionalData: string;

    walletId?: string;
  }) {
    const iv = await EncryptionStatic.getDeterministicIv(id, additionalData);

    return crypto.subtle.encrypt(
      { name: encr.name, iv },
      walletId ? this.walletKeys[walletId] : this.encryptionKey,
      stringToBuffer(JSON.stringify(data)),
    );
  }

  async decrypt<T>({
    b64data,
    id,
    additionalData,

    walletId,
  }: {
    b64data: string;
    id: string;
    additionalData: string;

    walletId?: string;
  }): Promise<T> {
    const iv = await EncryptionStatic.getDeterministicIv(id, additionalData),
      decrypted = await crypto.subtle.decrypt(
        { name: encr.name, iv },
        walletId ? this.walletKeys[walletId] : this.encryptionKey,
        decode(b64data),
      );

    return JSON.parse(bufferToString(decrypted)) as T;
  }

  /**
   * We generate this key once when we create the wallet.
   *
   * It will later be put in chest. So we need to be able to wrap it and, obviously, to encrypt and decrypt data.
   */
  generateSecretKeyForWallet() {
    return crypto.subtle.generateKey({ name: encr.name, length: encr.length }, true, [
      'encrypt',
      'decrypt',
      'wrapKey',
    ]);
  }

  async getChest(secretKey: CryptoKey): Promise<string> {
    const iv = EncryptionStatic.generateIv(),
      wrappedKey = await crypto.subtle.wrapKey('raw', secretKey, this.encryptionKey, {
        name: encr.name,
        iv,
      });

    return EncryptionStatic.encodeDataWithIv(iv, wrappedKey);
  }

  /**
   * Has two different modes:
   * 1. set walletId. Then the key will be saved in local object and not returned
   * 2. do not set walletId. Then the key will be returned and not saved in local object
   */
  async getSecretKeyFromChest(chest: string, walletId: string): Promise<void>;
  async getSecretKeyFromChest(chest: string): Promise<CryptoKey>;
  async getSecretKeyFromChest(chest: string, walletId?: string): Promise<CryptoKey | void> {
    const { data: key, iv } = EncryptionStatic.decodeDataWithIv(chest),
      exportable = !walletId,
      usages: KeyUsage[] = ['encrypt', 'decrypt'];

    if (exportable) usages.push('wrapKey');

    const walletKey = await crypto.subtle.unwrapKey(
      'raw',
      key,
      this.encryptionKey,
      { name: encr.name, iv },
      encr.name,
      exportable,
      usages,
    );
    if (exportable) return walletKey;
    else this.walletKeys[walletId!] = walletKey;
  }

  removeWalletIdSecretKey(walletId: string) {
    delete this.walletKeys[walletId];
  }
}

export const encryptionService = new EncryptionService();

export class InvitationSignatureService {
  invitationKeyPair: {
    privateKey: CryptoKey;
    publicKey: CryptoKey;
  };

  ecdhKeyPair: {
    privateKey: CryptoKey;
    b64publicKey: string;
  };

  /**
   * We only call it once when setting account's master password.
   */
  async generateInviteKey() {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: sign.name,
        modulusLength: 2048,
        publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
        hash: hash.name,
      },
      true,
      ['sign', 'verify'],
    );
    this.invitationKeyPair = { privateKey: keyPair.privateKey, publicKey: keyPair.publicKey };
  }

  async getServerReadyDataFromKeyPair(encryptionKey: CryptoKey) {
    const iv = EncryptionStatic.generateIv(),
      [exportedPublicKey, wrappedPrivateKey] = await Promise.all([
        crypto.subtle.exportKey('spki', this.invitationKeyPair.publicKey),
        crypto.subtle.wrapKey('pkcs8', this.invitationKeyPair.privateKey, encryptionKey, {
          name: encr.name,
          iv,
        }),
      ]);

    return {
      b64InvitePublicKey: encode(exportedPublicKey),
      b64EncryptedInvitePrivateKey: EncryptionStatic.encodeDataWithIv(iv, wrappedPrivateKey),
    };
  }

  async getKeysFromBackendData({
    encryptionKey,

    b64InvitePublicKey,
    b64EncryptedInvitePrivateKey,
  }: {
    encryptionKey: CryptoKey;

    b64InvitePublicKey: string;
    b64EncryptedInvitePrivateKey: string;
  }) {
    const { data: wrappedKey, iv } = EncryptionStatic.decodeDataWithIv(
        b64EncryptedInvitePrivateKey,
      ),
      [privateKey, publicKey] = await Promise.all([
        crypto.subtle.unwrapKey(
          'pkcs8',
          wrappedKey,
          encryptionKey,
          { name: encr.name, iv },
          { name: sign.name, hash: hash.name },
          true,
          ['sign'],
        ),
        crypto.subtle.importKey(
          'spki',
          decode(b64InvitePublicKey),
          { name: sign.name, hash: hash.name },
          false,
          ['verify'],
        ),
      ]);

    this.invitationKeyPair = { privateKey, publicKey };
  }

  private signatureDelimiter = '___';
  async sign(data: Object | string) {
    const toSign = stringToBuffer(typeof data === 'string' ? data : JSON.stringify(data)),
      signature = await crypto.subtle.sign(
        { name: sign.name, saltLength: sign.saltLength },
        this.invitationKeyPair.privateKey,
        toSign,
      );
    return {
      signature,
      encoded: `${encode(toSign)}${this.signatureDelimiter}${encode(signature)}`,
    };
  }

  async verify<Decoded = string>(encoded: string) {
    const [data, signature] = encoded.split(this.signatureDelimiter),
      [dataBuff, signatureBuff] = [decode(data), decode(signature)];
    let dataToReturn = data;
    try {
      dataToReturn = JSON.parse(bufferToString(dataBuff));
    } catch (e) {}

    return {
      isValid: await crypto.subtle.verify(
        { name: sign.name, saltLength: sign.saltLength },
        this.invitationKeyPair.publicKey,
        signatureBuff,
        dataBuff,
      ),
      data: (dataToReturn as unknown) as Decoded,
    };
  }

  async generateEcdhKey() {
    const keyPair = await crypto.subtle.generateKey(
      { name: agreement.name, namedCurve: agreement.namedCurve },
      true,
      ['deriveBits', 'deriveKey'],
    );
    this.ecdhKeyPair = {
      privateKey: keyPair.privateKey,
      b64publicKey: encode(await crypto.subtle.exportKey('spki', keyPair.publicKey)),
    };
  }

  async deriveEncryptionKeyFromEcdh(b64PublicKey: string) {
    const publicKey = await crypto.subtle.importKey(
      'spki',
      decode(b64PublicKey),
      {
        name: agreement.name,
        namedCurve: agreement.namedCurve,
      },
      false,
      [],
    );

    return crypto.subtle.deriveKey(
      { name: agreement.name, public: publicKey },
      this.ecdhKeyPair.privateKey,
      { name: encr.name, length: encr.length },
      false,
      ['wrapKey', 'unwrapKey'],
    );
  }
}

export const invitationSignatureService = new InvitationSignatureService();
