import { Wallet, setWallets, deleteWallet, updateWallet } from '@/stores/wallet';

const enum BackTypes {
  all = 'wallet/all',
  single = 'wallet/single',
  delete = 'wallet/delete',
}

export type WalletBackMessage =
  | { type: BackTypes.all; data: Wallet[] }
  | { type: BackTypes.single; data: Wallet }
  | { type: BackTypes.delete; data: string };

export const walletMessagesPrefix = 'wallet',
  walletHandleMessages = (message: WalletBackMessage) => {
    switch (message.type) {
      case BackTypes.all:
        setWallets(message.data);
        break;

      case BackTypes.single:
        updateWallet(message.data);
        break;

      case BackTypes.delete:
        deleteWallet(message.data);
        break;
    }
  };
