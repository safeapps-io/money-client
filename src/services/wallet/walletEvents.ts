import type { Wallet } from '$stores/wallet';
import { deleteWallet, setWallets, updateWallet } from '$stores/wallet';

export const walletEventsMap = new Map<string, Function>([
  ['wallet/all', (data: Wallet[]) => setWallets(data)],
  ['wallet/single', (data: Wallet) => updateWallet(data)],
  ['wallet/delete', ({ walletId }: { walletId: string }) => deleteWallet(walletId)],
]);
