import { eventSourceStoreConstructor } from '$utils/eventSourceStore';
import { billingPath } from '$services/config';
import type { ChargeEvent } from '$stores/billing';
import { addCharge } from '$stores/billing';
import { AuthService } from '$services/auth/authService';

type BillingBackMessage = { type: 'charge'; data: ChargeEvent };

export const billingEvents = eventSourceStoreConstructor({
  path: `${billingPath}/charge/updates`,
  handler: (message: BillingBackMessage) => {
    if (message.data.eventType == 'confirmed') AuthService.isUserStillValid();
    addCharge(message.data);
  },
});
