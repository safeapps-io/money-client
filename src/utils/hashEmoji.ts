import { stringToBuffer } from '@/utils/buffer/conversions';

// 80 different emojis
// prettier-ignore
const emojis = ['🇲🇿', '⚰', '💟', '💷', '🔤', '🐄', '☢', '⏪', '🍣', '🕦', '🍍', '🌱', '🌨', '🕧', '💁', '🎌', '🌐', '🍙', '⛏', '😋', '👾', '🅰️', '🇦🇶', '🏰', '🇷🇸', '👨‍👨‍👦‍👦', '📘', '🇰🇪', '⚡️', '🇻🇺', '🐪', '🖇', '👔', '🇹🇬', '🇬🇩', '✂️', '🇹🇯', '🕕', '🍶', '🇰🇵', '☝️', '👞', '♍️', '🔽', '🇬🇱', '▪️', '🍥', '🚉', '🔋', '📋', '💞', '🇪🇺', '🇧🇳', '🐀', '➰', '🚓', '🎢', '📄', '👉', '🕑', '8️⃣', '🌊', '🐨', '🍄', '💄', '🌠', '🏋', '🇹🇫', '🇷🇼', '🦄', '😳', '😜', '🍆', '👙', '🎼', '🇸🇱', '🇹🇴', '🍷', '♻️', '📥'],
  algorithm = 'SHA-256';

export const getEmojiHash = async (data: string, length = 7) => {
  // Took idea from here: https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#Converting_a_digest_to_a_hex_string
  const hash = await crypto.subtle.digest(algorithm, stringToBuffer(data)),
    hashArray = Array.from(new Uint8Array(hash)),
    hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join(''),
    decimalHash = parseInt(hashHex, 16);

  // Took idea from here: https://github.com/earobinson/hash-emoji
  let emojiIndex = decimalHash % Math.pow(emojis.length, length),
    emojiString = '';

  for (let i = 0; i < length; i++) {
    emojiString = `${emojis[emojiIndex % emojis.length]}${emojiString}`;
    emojiIndex = Math.floor(emojiIndex / emojis.length);
  }
  return { emojiString, hashHex };
};
