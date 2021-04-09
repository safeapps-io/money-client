import type { ChargeEvent } from '$stores/billing';
import { addCharge } from '$stores/billing';
import { AuthService } from '$services/auth/authService';

const enum BackTypes {
  newCharge = 'billing/charge',
}

export type BillingBackMessage = { type: BackTypes.newCharge; data: ChargeEvent };

export const billingMessagesPrefix = 'billing',
  billingHandleMessages = (message: BillingBackMessage) => {
    if (message.data.eventType == 'confirmed') AuthService.isUserStillValid();
    addCharge(message.data);
  };
