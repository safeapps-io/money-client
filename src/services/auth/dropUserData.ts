import { resetEncryptionKeysState } from '@/stores/encr/keysState';
import { resetEncryptedStore } from '@/stores/encr/store';
import { resetUserStore } from '@/stores/user';
import { resetWalletStores } from '@/stores/wallet';

export const dropUserData = () => {
  resetEncryptionKeysState();

  resetUserStore();
  resetWalletStores();
  resetEncryptedStore();
};
