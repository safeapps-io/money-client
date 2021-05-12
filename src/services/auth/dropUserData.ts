import { resetEncryptionKeysState } from '$stores/encr/keysState';
import { setStartStateForKeys } from '$services/crypto/keys';
import { resetEncryptedStore } from '$stores/encr/store';
import { resetUserStore } from '$stores/user';
import { resetWalletStores } from '$stores/wallet';

export const dropUserData = () => {
  setStartStateForKeys();
  resetEncryptionKeysState();

  resetUserStore();
  resetWalletStores();
  resetEncryptedStore();
};
