import { resetEncryptionKeysState } from '$stores/encr/keysState';
import { setStartStateForKeys } from '$services/crypto/keys';
import { resetEncryptedStore } from '$stores/encr/store';
import { resetUserStore } from '$stores/user';
import { resetWalletStores } from '$stores/wallet';
import { assetReset } from '$stores/decr/asset';
import { categoryReset } from '$stores/decr/category';
import { correctionTransactionReset } from '$stores/decr/correctionTransaction';
import { deletedReset } from '$stores/decr/deleted';
import { ignoredTransactionReset } from '$stores/decr/ignoredTransaction';
import { referenceTransactionReset } from '$stores/decr/referenceTransaction';
import { searchFilterReset } from '$stores/decr/searchFilter';
import { transactionReset } from '$stores/decr/transaction';
import { walletDataReset } from '$stores/decr/wallet';
import { walletUserReset } from '$stores/decr/walletUser';

export const dropUserData = () => {
  setStartStateForKeys();
  resetEncryptionKeysState();

  resetUserStore();
  resetWalletStores();
  resetEncryptedStore();

  assetReset();
  categoryReset();
  correctionTransactionReset();
  deletedReset();
  ignoredTransactionReset();
  referenceTransactionReset();
  searchFilterReset();
  transactionReset();
  walletDataReset();
  walletUserReset();
};
