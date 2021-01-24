export const stringToBuffer = (data: string) => new TextEncoder().encode(data),
  bufferToString = (data: ArrayBuffer, encoding = 'utf-8') =>
    new TextDecoder(encoding).decode(data);
