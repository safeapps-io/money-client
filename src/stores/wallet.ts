import { derived, get, writable, Writable } from 'svelte/store';

import { UserEncrState, userEncrStore } from './user';
import { resetStore } from '@/utils/persistStore';

import { userDecrStore } from '@/stores/decr/user';
import { debugLog } from '@/core/logger';

export enum AccessLevels {
  owner = 'owner',
  usual = 'usual',
  rejected = 'rejected',
  deleted = 'deleted',
}

export type PublicUserData = Omit<
  UserEncrState,
  'inviterId' | 'email' | 'b64InvitePublicKey' | 'b64EncryptedInvitePrivateKey' | 'b64salt' | 'encr'
> & {
  WalletAccess: {
    id: string;
    created: number;
    updated: number;
    inviteId: string;
    chest: string;
    accessLevel: AccessLevels;
  };
};

export type Wallet = {
  id: string;
  created: number;
  updated: number;

  users: PublicUserData[];
};

export type WalletState = {
  [id: string]: Wallet;
};

export const walletCacheKey = 'wallet',
  walletStore = writable<WalletState | null>(null),
  jointWalletsStore = derived(userDecrStore, $user => ($user ? $user.decr.jointWallets : null));

export const selectedWalletCacheKey = 'selectedWallet',
  selectedWalletStore = writable<string | null>(null),
  selectedJointWalletCacheKey = 'selectedJointWallet',
  selectedJointWalletStore = writable<string | null>(null);

export const currentChestsStore = derived([walletStore, userEncrStore], ([$wallet, $user]) => {
  if (!$wallet || !$user) return [];

  return Object.values($wallet).map(wallet => ({
    walletId: wallet.id,
    chest: wallet.users.find(user => user.id === $user.id)!.WalletAccess.chest,
  }));
});

export const resetWalletStores = () => {
    resetStore(walletStore);
    resetStore(selectedWalletStore);
    resetStore(selectedJointWalletStore);
  },
  setWallets = (wallets: Wallet[]) =>
    walletStore.set(
      wallets.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {} as WalletState),
    ),
  updateWallet = (wallet: Wallet) =>
    walletStore.update($state => {
      $state![wallet.id] = wallet;
      return $state;
    }),
  setCurrentWallet = (id: string | null) => selectedWalletStore.set(id),
  setSelectedJointWallet = (id: string | null) => selectedJointWalletStore.set(id),
  setUserSelectedWallet = (setId?: string) => {
    const walletState = get(walletStore) || {};

    // Setting a default value of the first wallet in walletStore
    const id = setId || Object.keys(walletState || {})[0] || null;

    if (id && id in walletState) {
      setCurrentWallet(id);
      return setSelectedJointWallet(null);
    }

    const jointWalletState = get(jointWalletsStore) || {};
    if (id && id in jointWalletState) {
      setCurrentWallet(null);
      return setSelectedJointWallet(id);
    }

    debugLog("[wallet store] didn't find id in states", {
      id,
      walletIds: Object.keys(walletState),
      jointWalletIds: Object.keys(jointWalletState),
    });
  },
  addWallet = (wallet: Wallet) =>
    walletStore.update($state => {
      const s = $state || {};
      s[wallet.id] = wallet;
      return s;
    }),
  deleteWallet = (id: string) =>
    walletStore.update($state => {
      if ($state && id in $state) delete $state[id];
      return $state;
    }),
  updateChests = (currentUserId: string, chestData: { chest: string; walletId: string }[]) =>
    walletStore.update($state => {
      if (!$state) return null;

      chestData.forEach(({ walletId, chest }) =>
        $state[walletId].users.forEach(user => {
          if (user.id === currentUserId) user.WalletAccess.chest = chest;
        }),
      );

      return $state;
    });

export const currentWalletStore = derived(
    [walletStore, selectedWalletStore],
    // We make this store a dumb one. It doesn't set anything, just returns either wallet
    // or nothing based on current states.
    ([$wallets, $selected]) =>
      $wallets && $selected && $wallets[$selected] ? $wallets[$selected] : null,
  ),
  deriveCurrentEnts = <T>(store: Writable<{ [walletId: string]: { [id: string]: T } }>) =>
    derived(
      [selectedWalletStore, selectedJointWalletStore, jointWalletsStore, store],
      ([$walletId, $jointWallet, $jointWallets, $state]) => {
        let res: { [id: string]: T } = {};
        if ($walletId) res = $state[$walletId] || {};
        else if ($jointWallet && $jointWallets)
          res = $jointWallets[$jointWallet].walletIds.reduce(
            (acc, curr) => ({ ...acc, ...$state[curr] }),
            {},
          );

        return res;
      },
    );
