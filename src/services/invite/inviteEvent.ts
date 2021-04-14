import { eventSourceStoreConstructor } from '$utils/eventSourceStore';
import type { OwnerInviteValidate } from './inviteStages';
import { inviteResolutionStore, addInviteToValidate, InviteResolutions } from './inviteStages';
import { apiPath } from '$services/config';

export const inviteEvents = eventSourceStoreConstructor({
  path: `${apiPath}/invite/join/updates`,
  handler: (message: InviteBackMessage) => {
    switch (message.type) {
      case 'validate':
        addInviteToValidate(message.data);
        break;

      case 'error':
        inviteResolutionStore.set({ type: InviteResolutions.error });
        break;

      case 'reject':
        inviteResolutionStore.set({ type: InviteResolutions.reject });
        break;

      case 'accept':
        inviteResolutionStore.set({ type: InviteResolutions.accept, payload: message.data });
        break;
    }
  },
});

type InviteBackMessage =
  | { type: 'validate'; data: OwnerInviteValidate }
  | { type: 'error'; data: { walletId: string } }
  | {
      type: 'accept';
      data: {
        walletId: string;
        encryptedSecretKey: string;
        b64PublicECDHKey: string;
      };
    }
  | { type: 'reject'; data: { walletId: string } };
