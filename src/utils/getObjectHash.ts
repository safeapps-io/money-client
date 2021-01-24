import { stringToBuffer } from './buffer/conversions';

// Got hex conversion from here:
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#Converting_a_digest_to_a_hex_string
export const getObjectHash = async (obj: Object) => {
  const sortedArrFromObj = Object.entries(obj).sort(([key], [key2]) => key.localeCompare(key2)),
    hashBuffer = await crypto.subtle.digest(
      'SHA-1',
      stringToBuffer(JSON.stringify(sortedArrFromObj)),
    );

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};
