import { derived, writable } from 'svelte/store';

export const plansStore = writable<PlanPartial[]>([]);

let timer: number;
export const isSubscriptionActiveStore = derived(plansStore, $plans => {
  const currentPlan = $plans.sort((plan1, plan2) => (plan2.expires || 0) - (plan1.expires || 0))[0],
    now = new Date().getTime(),
    isActive = currentPlan.expires && currentPlan.expires > now;

  // Always clearing the timeout
  clearTimeout(timer);

  if (isActive) {
    // Setting the timout at the time the plan expires + 100ms (to be sure)
    const diff = currentPlan.expires! - now + 100;
    timer = window.setTimeout(() => plansStore.update($state => $state), diff);
  }

  return !!isActive;
});

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
