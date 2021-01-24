import { request } from '@/services/request';
import { encryptionService } from '@/services/crypto/cryptoService';

import { Wallet, addWallet, setCurrentWallet, deleteWallet } from '@/stores/wallet';
import { walletDataAdd } from '@/stores/decr/wallet';
import { addDefaultSearchFilter } from '@/stores/decr/searchFilter';
import { walletUserAdd } from '@/stores/decr/walletUser';
import { generateRandomColor } from '@/utils/color';
import { assetAdd } from '@/stores/decr/asset';

export class WalletService {
  private static prefix = '/wallet/';

  static async create({
    walletName,
    username,
    assetCode,
  }: {
    walletName: string;
    username: string;
    assetCode: string;
  }) {
    const secret = await encryptionService.generateSecretKeyForWallet(),
      chest = await encryptionService.getChest(secret),
      { json: wallet } = await request<Wallet>({
        method: 'POST',
        path: `${this.prefix}create`,
        data: { chest },
      });

    // Setting key that is not exportable and will be used in all other places
    await encryptionService.getSecretKeyFromChest(chest, wallet.id);

    addWallet(wallet);
    await Promise.all([
      walletDataAdd(wallet.id, { name: walletName, balance: false }),
      walletUserAdd(wallet.id, { name: username, color: generateRandomColor() }),
      assetAdd(wallet.id, { code: assetCode }),
      addDefaultSearchFilter(wallet.id),
    ]);
    setCurrentWallet(wallet.id);

    return wallet;
  }

  static async delete(id: string) {
    await request({
      method: 'POST',
      path: `${this.prefix}delete`,
      data: { walletId: id },
    });

    deleteWallet(id);
  }

  static async deleteUser(walletId: string, userId: string) {
    const { json: wallet } = await request<Wallet>({
      method: 'POST',
      path: `${this.prefix}user/delete`,
      data: { walletId, userId },
    });

    addWallet(wallet);
  }

  static async joinWallet(walletId: string, chest: string) {
    const { json: wallet } = await request<Wallet>({
      method: 'POST',
      path: `${this.prefix}updateChest`,
      data: { walletId, chest },
    });

    await encryptionService.getSecretKeyFromChest(chest, walletId);

    addWallet(wallet);
    setCurrentWallet(wallet.id);

    return wallet;
  }
}
