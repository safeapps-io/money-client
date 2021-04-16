import { decode, encode } from 'base64-arraybuffer-es6';
import { bufferToString, stringToBuffer } from '$utils/buffer/conversions';
import {
  decodeDataWithIv,
  encodeDataWithIv,
  encr,
  fullSignKeyUsages,
  generateIv,
  hashAlgo,
  signAlgo,
  agreementAlgo,
} from './common';

export const generateInviteKeys = () =>
  crypto.subtle.generateKey(
    {
      name: signAlgo.name,
      modulusLength: signAlgo.modulus,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: hashAlgo.name,
    },
    true,
    fullSignKeyUsages,
  );

export const generateEcdhKey = async () => {
    const keyPair = await crypto.subtle.generateKey(
      { name: agreementAlgo.name, namedCurve: agreementAlgo.namedCurve },
      true,
      ['deriveBits', 'deriveKey'],
    );
    return {
      private: keyPair.privateKey,
      public: encode(await crypto.subtle.exportKey('spki', keyPair.publicKey)),
    };
  },
  deriveEncryptionKeyFromEcdh = async (privateKey: CryptoKey, exportedPublicKey: string) => {
    const publicKey = await crypto.subtle.importKey(
      'spki',
      decode(exportedPublicKey),
      {
        name: agreementAlgo.name,
        namedCurve: agreementAlgo.namedCurve,
      },
      false,
      [],
    );

    return crypto.subtle.deriveKey(
      { name: agreementAlgo.name, public: publicKey },
      privateKey,
      { name: encr.name, length: encr.length },
      false,
      ['wrapKey', 'unwrapKey'],
    );
  };

export const wrapKeyPair = async (keyPairToWrap: CryptoKeyPair, wrappingKey: CryptoKey) => {
    const iv = generateIv(),
      [exportedPublicKey, wrappedPrivateKey] = await Promise.all([
        crypto.subtle.exportKey('spki', keyPairToWrap.publicKey),
        crypto.subtle.wrapKey('pkcs8', keyPairToWrap.privateKey, wrappingKey, {
          name: encr.name,
          iv,
        }),
      ]);

    return {
      public: encode(exportedPublicKey),
      private: encodeDataWithIv(iv, wrappedPrivateKey),
    };
  },
  unwrapKeyPair = async (
    wrappedPublicKey: string,
    wrappedPrivateKey: string,
    wrappingKey: CryptoKey,
  ) => {
    const { data: wrappedKey, iv } = decodeDataWithIv(wrappedPrivateKey),
      [privateKey, publicKey] = await Promise.all([
        crypto.subtle.unwrapKey(
          'pkcs8',
          wrappedKey,
          wrappingKey,
          { name: encr.name, iv },
          { name: signAlgo.name, hash: hashAlgo.name },
          true,
          ['sign'],
        ),
        crypto.subtle.importKey(
          'spki',
          decode(wrappedPublicKey),
          { name: signAlgo.name, hash: hashAlgo.name },
          false,
          ['verify'],
        ),
      ]);

    return { privateKey, publicKey };
  };

const signatureDelimiter = '___';
export const utilSign = async (privateKey: CryptoKey, data: Object | string) => {
    const toSign = stringToBuffer(typeof data === 'string' ? data : JSON.stringify(data)),
      signature = await crypto.subtle.sign(
        { name: signAlgo.name, saltLength: signAlgo.saltLength },
        privateKey,
        toSign,
      );
    return {
      signature,
      encoded: `${encode(toSign)}${signatureDelimiter}${encode(signature)}`,
    };
  },
  utilVerify = async <T = string>(publicKey: CryptoKey, encoded: string) => {
    const [data, signature] = encoded.split(signatureDelimiter),
      [dataBuff, signatureBuff] = [decode(data), decode(signature)];
    let dataToReturn = data;
    try {
      dataToReturn = JSON.parse(bufferToString(dataBuff));
    } catch (e) {}

    return {
      isValid: await crypto.subtle.verify(
        { name: signAlgo.name, saltLength: signAlgo.saltLength },
        publicKey,
        signatureBuff,
        dataBuff,
      ),
      data: (dataToReturn as unknown) as T,
    };
  };
