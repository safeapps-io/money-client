import { decode, encode } from 'base64-arraybuffer-es6';

import { bufferToString, stringToBuffer } from '$utils/buffer/conversions';

export const encr = { name: 'AES-GCM', length: 256 },
  ivSize = 128,
  saltSize = 256,
  deriveAlgo = { name: 'PBKDF2', iterations: 150_000, pinIterations: 1_000_000 },
  hashAlgo = { name: 'SHA-512' },
  signAlgo = { name: 'RSA-PSS', saltLength: 64, modulus: 2048 },
  agreementAlgo = { name: 'ECDH', namedCurve: 'P-384' };

export const fullEncrKeyUsages: KeyUsage[] = ['encrypt', 'decrypt', 'wrapKey', 'unwrapKey'],
  fullSignKeyUsages: KeyUsage[] = ['sign', 'verify'];

export const getRandom = (size: number) => crypto.getRandomValues(new Uint8Array(size)),
  generateIv = () => getRandom(ivSize),
  encodeDataWithIv = (iv: ArrayBuffer, data: ArrayBuffer) => {
    const encoded: EncodedWithIv = { iv: encode(iv), data: encode(data) };
    return encode(stringToBuffer(JSON.stringify(encoded)));
  },
  decodeDataWithIv = (b64data: string) => {
    const { iv, data } = JSON.parse(bufferToString(decode(b64data))) as EncodedWithIv;
    return { iv: decode(iv), data: decode(data) };
  };

type EncodedWithIv = {
  iv: string;
  data: string;
};
