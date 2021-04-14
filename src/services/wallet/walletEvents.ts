import { eventSourceStoreConstructor } from '$utils/eventSourceStore';
import type { Wallet } from '$stores/wallet';
import { deleteWallet, setWallets, updateWallet } from '$stores/wallet';
import { apiPath } from '$services/config';

type WalletBackMessage =
  | { type: 'all'; data: Wallet[] }
  | { type: 'single'; data: Wallet }
  | { type: 'delete'; data: string };

export const walletEvents = eventSourceStoreConstructor({
  path: `${apiPath}/wallet/updates`,
  handler: (message: WalletBackMessage) => {
    switch (message.type) {
      case 'all':
        setWallets(message.data);
        break;

      case 'single':
        updateWallet(message.data);
        break;

      case 'delete':
        deleteWallet(message.data);
        break;
    }
  },
});
