import { derived, writable } from 'svelte/store';
import { entityCountByWallet } from './encr/store';
import { userEncrStore } from './user';
import { walletStore, AccessLevels, currentWalletStore } from './wallet';

export const plansStore = writable<PlanPartial[]>([]),
  limitStore = writable<number>(0);

let timers: number[] = [];
const isPlanActiveByWalletId = derived(
  [walletStore, entityCountByWallet, limitStore],
  ([$wallets, $encrCount, $limit]) => {
    if (!$wallets) return {};

    timers.map(clearTimeout);
    timers = [];

    const result: { [walletId: string]: { isActive: boolean; limit?: number; count?: number } } =
        {},
      now = new Date().getTime();

    for (const wallet of Object.values($wallets)) {
      const { plans } = wallet.users.find(
          user => user.WalletAccess.accessLevel == AccessLevels.owner,
        )!,
        currentPlan = plans.sort((p1, p2) => p1.created - p2.created)[0],
        isActive = currentPlan?.expires ? currentPlan.expires > now : false;
      result[wallet.id] = { isActive };

      if (isActive) {
        // Setting the timout at the time the plan expires + 100ms (to be sure)
        const diff = currentPlan.expires! - now + 100;
        timers.push(window.setTimeout(() => walletStore.update($state => $state), diff));

        // Break the cycle. No need in further checks
        continue;
      }

      // If the entity count is lower than the limit, we consider the subscription active.
      result[wallet.id] = {
        isActive: $encrCount[wallet.id] < $limit,
        limit: $limit,
        count: $encrCount[wallet.id],
      };
    }

    return result;
  },
);

export const unsortedChargeEventsStore = writable<ChargeEvent[]>([]),
  chargeEventsStore = derived(unsortedChargeEventsStore, $charges =>
    $charges.filter(ch => ch.eventType != 'created').sort((ch1, ch2) => ch2.created - ch1.created),
  );

export const addCharge = (chargeEvent: ChargeEvent) => {
  unsortedChargeEventsStore.update($state =>
    $state.map(charge => charge.id).includes(chargeEvent.id) ? $state : [chargeEvent, ...$state],
  );
};

export const planGuardStore = derived(
  [isPlanActiveByWalletId, currentWalletStore, userEncrStore],
  ([$isSubsActiveForWallet, $currentWalletStore, $userEncrStore]) => {
    if (!$currentWalletStore) return { userCanBuy: false, isActive: false };

    const { id: ownerId } = $currentWalletStore.users.find(
      user => user.WalletAccess.accessLevel == AccessLevels.owner,
    )!;
    return {
      userCanBuy: ownerId == $userEncrStore!.id,
      ...$isSubsActiveForWallet[$currentWalletStore.id],
    };
  },
);

type BaseModel = {
  id: string;
  created: number;
  updated: number;
};
export type PlanPartial = BaseModel & { expires: number | null };
export type PlanFull = PlanPartial & {
  product: Product;
  chargeEvents: ChargeEvent[];
};
export type Product = BaseModel & {
  slug: string;
  price: number;
  duration: number;
  trialDuration: number | null;
};
export type Providers = 'coinbase' | 'tinkoff';
export type ChargeEvent = BaseModel & {
  eventType: 'created' | 'pending' | 'confirmed' | 'failed' | 'refunded';
  chargeType: 'trial' | 'purchase' | 'viral' | 'manual';
  provider: Providers | null;
  expiredOld: number | null;
  expiredNew: number | null;
};
