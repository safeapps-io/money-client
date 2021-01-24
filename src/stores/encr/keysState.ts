import { writable } from 'svelte/store';

export type EncryptionKeysState = {
  encryptionKeySet: boolean;
  walletKeysSet: boolean;
  initialDecryptionFinished: boolean;
};

const startState = {
  encryptionKeySet: false,
  walletKeysSet: false,
  initialDecryptionFinished: false,
};

export const encryptionKeysStateStore = writable(startState);

const partialSetTrue = (key: keyof EncryptionKeysState) => (value: boolean) =>
  encryptionKeysStateStore.update($state => ({ ...$state, [key]: value }));

export const encryptionKeySet = partialSetTrue('encryptionKeySet'),
  walletKeysSet = partialSetTrue('walletKeysSet'),
  initialDecryptionSet = partialSetTrue('initialDecryptionFinished'),
  resetEncryptionKeysState = () => encryptionKeysStateStore.set(startState);
