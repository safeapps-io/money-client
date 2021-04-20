import { generateRandomColor } from '$utils/color';
import { generateKey } from '$utils/crypto/encryption';

import { del, post, put, request } from '$services/request';
import type { Wallet } from '$stores/wallet';
import { addWallet, setCurrentWallet, deleteWallet } from '$stores/wallet';
import { walletDataAdd } from '$stores/decr/wallet';
import { addDefaultSearchFilter } from '$stores/decr/searchFilter';
import { walletUserAdd } from '$stores/decr/walletUser';
import { assetAdd } from '$stores/decr/asset';
import { generateChest, setWalletKeyFromChest } from '$services/crypto/keys';

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
    const secret = await generateKey(),
      chest = await generateChest(secret),
      { json: wallet } = await request<Wallet>({
        method: post,
        path: this.prefix,
        data: { chest },
      });

    // Setting key that is not exportable and will be used in all other places
    await setWalletKeyFromChest(chest, wallet.id);

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
      method: del,
      path: `${this.prefix}${id}`,
    });

    deleteWallet(id);
  }

  static async joinWallet(walletId: string, chest: string) {
    const { json: wallet } = await request<Wallet>({
      method: put,
      path: `${this.prefix}${walletId}`,
      data: { chest },
    });

    await setWalletKeyFromChest(chest, walletId);

    addWallet(wallet);
    setCurrentWallet(wallet.id);

    return wallet;
  }

  static async deleteUser(walletId: string, userId: string) {
    const { json: wallet } = await request<Wallet>({
      method: del,
      path: `${this.prefix}${walletId}/user/${userId}`,
    });

    addWallet(wallet);
  }
}
