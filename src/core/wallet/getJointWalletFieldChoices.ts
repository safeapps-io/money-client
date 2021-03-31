import type { walletDataStore } from '$stores/decr/wallet';
import type { jointWalletsStore, selectedJointWalletStore } from '$stores/wallet';

export const getSelectedJointWalletIds = (
    selectedJointWalletState: StoreValue<typeof selectedJointWalletStore>,
    jointWalletsState: StoreValue<typeof jointWalletsStore>,
  ) =>
    selectedJointWalletState ? jointWalletsState?.[selectedJointWalletState].walletIds || [] : [],
  getJointWalletFieldChoices = (
    walletDataState: StoreValue<typeof walletDataStore>,
    selectedJointWalletIds: string[],
  ) =>
    Object.values(walletDataState!)
      .filter(wallet => selectedJointWalletIds.includes(wallet.walletId))
      .map(wallet => ({
        value: wallet.walletId,
        label: wallet.decr.name,
      }));
