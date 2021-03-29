import type { OwnerInviteValidate } from './inviteStages';
import { addInviteToValidate, inviteResolutionStore, InviteResolutions } from './inviteStages';

const enum BackTypes {
  validate = 'invite/validate',

  triggerSuccess = 'invite/validateTriggerSuccess',
  triggerError = 'invite/validateTriggerError',

  error = 'invite/invititationError',
  reject = 'invite/reject',
  accept = 'invite/accept',
}
export type InviteBackMessage =
  | {
      type: BackTypes.validate;
      data: OwnerInviteValidate;
    }
  | { type: BackTypes.triggerSuccess; data: { error: string } }
  | { type: BackTypes.triggerError; data: { error: string } }
  | {
      type: BackTypes.error;
      data: {
        walletId: string;
      };
    }
  | {
      type: BackTypes.accept;
      data: {
        walletId: string;
        encryptedSecretKey: string;
        b64PublicECDHKey: string;
      };
    }
  | {
      type: BackTypes.reject;
      data: {
        walletId: string;
      };
    };

export const inviteMessagesPrefix = 'invite',
  inviteHandleMessages = (message: InviteBackMessage) => {
    switch (message.type) {
      // The only message wallet owner receives
      case BackTypes.validate: {
        addInviteToValidate(message.data);
        break;
      }

      // All the messages below are received by the joining user
      case BackTypes.triggerError:
      case BackTypes.error: {
        inviteResolutionStore.set({ type: InviteResolutions.error });
        break;
      }
      case BackTypes.reject: {
        inviteResolutionStore.set({ type: InviteResolutions.reject });
        break;
      }
      case BackTypes.accept: {
        inviteResolutionStore.set({ type: InviteResolutions.accept, payload: message.data });
        break;
      }
    }
  };
