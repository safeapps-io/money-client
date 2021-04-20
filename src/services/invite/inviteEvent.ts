import type { OwnerInviteValidate } from './inviteStages';
import { inviteResolutionStore, addInviteToValidate, InviteResolutions } from './inviteStages';

export const inviteEventsMap = new Map<string, Function>([
  ['invite/validate', (data: OwnerInviteValidate) => addInviteToValidate(data)],
  ['invite/error', () => inviteResolutionStore.set({ type: InviteResolutions.error })],
  ['invite/reject', () => inviteResolutionStore.set({ type: InviteResolutions.reject })],
  [
    'invite/accept',
    (data: { walletId: string; encryptedSecretKey: string; b64PublicECDHKey: string }) =>
      inviteResolutionStore.set({ type: InviteResolutions.accept, payload: data }),
  ],
]);
