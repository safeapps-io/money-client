import { encode, decode } from 'base64-arraybuffer-es6';

import { stringToBuffer, bufferToString } from '$utils/buffer/conversions';
import {
  decodeDataWithIv,
  deriveAlgo,
  encodeDataWithIv,
  encr,
  generateIv,
  getRandom,
  hashAlgo,
  saltSize,
  fullEncrKeyUsages,
} from './common';
import { concatArrayBuffers } from '$utils/buffer/concat';

export const generateSalt = () => {
  const salt = getRandom(saltSize);
  return { salt, b64salt: encode(salt) };
};

export const generateKey = () =>
    crypto.subtle.generateKey({ name: encr.name, length: encr.length }, true, [
      'encrypt',
      'decrypt',
      'wrapKey',
    ]),
  deriveKeyFromInput = async (salt: ArrayBuffer, input: ArrayBuffer, iterations: number) =>
    crypto.subtle.deriveKey(
      {
        salt,
        name: deriveAlgo.name,
        hash: hashAlgo.name,
        iterations,
      },
      await crypto.subtle.importKey('raw', input, deriveAlgo.name, false, [
        'deriveKey',
        'deriveBits',
      ]),
      { name: encr.name, length: encr.length },
      true,
      fullEncrKeyUsages,
    );

export const wrapKey = async (keyToWrap: CryptoKey, wrappingKey: CryptoKey) => {
    const iv = generateIv(),
      wrappedKey = await crypto.subtle.wrapKey('raw', keyToWrap, wrappingKey, {
        name: encr.name,
        iv,
      });

    return encodeDataWithIv(iv, wrappedKey);
  },
  unwrapKey = async (
    wrappedKey: string,
    unwrappingKey: CryptoKey,
    exportable = true,
    usages = fullEncrKeyUsages,
  ) => {
    const { iv, data: keyToUnwrap } = decodeDataWithIv(wrappedKey);
    return crypto.subtle.unwrapKey(
      'raw',
      keyToUnwrap,
      unwrappingKey,
      { name: encr.name, iv },
      encr.name,
      exportable,
      usages,
    );
  };

const getDeterministicIv = async (id: string, additionalData: string) => {
  const [buff1, buff2] = await Promise.all(
    [id, additionalData]
      .map(stringToBuffer)
      .map(buffer => crypto.subtle.digest(hashAlgo.name, buffer)),
  );
  return concatArrayBuffers(buff1, buff2);
};

/**
 * A generic method to encrypt some data.
 * Can be used to encrypt wallet data or user data.
 *
 * @param param0.additionalData Some additional data that will be used in generating deterministic IV.
 *        For wallet data it should be wallet id.
 *        For user data it should be user's salt.
 */
export const utilEncrypt = async (key: CryptoKey, data: any, id: string, additionalData: string) =>
  crypto.subtle.encrypt(
    { name: encr.name, iv: await getDeterministicIv(id, additionalData) },
    key,
    stringToBuffer(JSON.stringify(data)),
  );

export const utilDecrypt = async <T>(
  key: CryptoKey,
  b64data: string,
  id: string,
  additionalData: string,
) => {
  const iv = await getDeterministicIv(id, additionalData),
    decrypted = await crypto.subtle.decrypt({ name: encr.name, iv }, key, decode(b64data));

  return JSON.parse(bufferToString(decrypted)) as T;
};
