import type { ChargeEvent } from '$stores/billing';
import { addCharge } from '$stores/billing';
import { AuthService } from '$services/auth/authService';

export const billingEventsMap = new Map([
  [
    'billing/charge',
    (data: ChargeEvent) => {
      if (data.eventType == 'confirmed') AuthService.init();
      addCharge(data);
    },
  ],
]);
