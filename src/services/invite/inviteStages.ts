import { writable, derived } from 'svelte/store';

export type OwnerInviteValidate = {
  b64InviteString: string;
  b64InviteSignatureByJoiningUser: string;
  joiningUser: {
    id: string;
    username: string;
    b64PublicECDHKey: string;
  };
};

const allInvitesToValidate = writable<OwnerInviteValidate[]>([]);

export const inviteToValidate = derived(
    allInvitesToValidate,
    $invites => $invites[0] as OwnerInviteValidate | undefined,
  ),
  addInviteToValidate = (data: OwnerInviteValidate) =>
    allInvitesToValidate.update(val => [...val, data]),
  removeInvite = (inviteString: string) =>
    allInvitesToValidate.update(val =>
      val.filter(invite => invite.b64InviteString !== inviteString),
    );

export enum InviteResolutions {
  error = '0',
  reject = '1',
  accept = '2',
}
export type InviteResolutionPayloads =
  | {
      type: InviteResolutions.error | InviteResolutions.reject;
    }
  | {
      type: InviteResolutions.accept;
      payload: {
        walletId: string;
        encryptedSecretKey: string;
        b64PublicECDHKey: string;
      };
    };
export const inviteResolutionStore = writable<InviteResolutionPayloads | null>(null);
