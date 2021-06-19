import { derived, writable } from 'svelte/store';
import { userEncrStore } from './user';
import { walletStore, AccessLevels, currentWalletStore } from './wallet';

export const plansStore = writable<PlanPartial[]>([]),
  limitStore = writable<number>(0);

let timer: number;
export const isSubscriptionActiveStore = derived(plansStore, $plans => {
  const currentPlan = $plans.sort((plan1, plan2) => (plan2.expires || 0) - (plan1.expires || 0))[0],
    now = new Date().getTime(),
    isActive = currentPlan?.expires && currentPlan.expires > now;

  // Always clearing the timeout
  clearTimeout(timer);

  if (isActive) {
    // Setting the timout at the time the plan expires + 100ms (to be sure)
    const diff = currentPlan.expires! - now + 100;
    timer = window.setTimeout(() => plansStore.update($state => $state), diff);
  }

  return !!isActive;
});

let timers: number[] = [];
export const isPlanActiveByWallet = derived(walletStore, $wallets => {
  if (!$wallets) return {};

  timers.map(clearTimeout);
  timers = [];

  const result: { [walletId: string]: boolean } = {},
    now = new Date().getTime();

  for (const wallet of Object.values($wallets)) {
    const { plans } = wallet.users.find(
        user => user.WalletAccess.accessLevel == AccessLevels.owner,
      )!,
      currentPlan = plans.sort((p1, p2) => p1.created - p2.created)[0],
      isActive = currentPlan.expires ? currentPlan.expires > now : false;
    result[wallet.id] = isActive;

    if (isActive) {
      // Setting the timout at the time the plan expires + 100ms (to be sure)
      const diff = currentPlan.expires! - now + 100;
      timers.push(window.setTimeout(() => walletStore.update($state => $state), diff));
    }
  }

  return result;
});

export const unsortedChargeEventsStore = writable<ChargeEvent[]>([]),
  chargeEventsStore = derived(unsortedChargeEventsStore, $charges =>
    $charges.filter(ch => ch.eventType != 'created').sort((ch1, ch2) => ch2.created - ch1.created),
  );

export const addCharge = (chargeEvent: ChargeEvent) => {
  unsortedChargeEventsStore.update($state =>
    $state.map(charge => charge.id).includes(chargeEvent.id) ? $state : [chargeEvent, ...$state],
  );
};

/**
 * Usually we check if current wallet's owner has a subscription. It's a
 * more popular requirement.
 *
 * But in some cases we need to check if current user has it. This flag
 * enables this exact check over wallet's owner check.
 */
export const planGuardStore = derived(
  [isSubscriptionActiveStore, currentWalletStore, userEncrStore],
  ([$isSubscriptionActiveStore, $currentWalletStore, $userEncrStore]) =>
    (currentUserCheck: boolean) => {
      let userCanBuy: boolean, planActive: boolean;
      if (!$currentWalletStore || currentUserCheck) {
        userCanBuy = true;
        planActive = $isSubscriptionActiveStore;
      } else {
        const { id: ownerId, plans } = $currentWalletStore.users.find(
          user => user.WalletAccess.accessLevel == AccessLevels.owner,
        )!;
        userCanBuy = ownerId == $userEncrStore!.id;
        planActive = plans.some(plan => plan.expires && plan.expires > new Date().getTime());
      }

      return { userCanBuy, planActive };
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
