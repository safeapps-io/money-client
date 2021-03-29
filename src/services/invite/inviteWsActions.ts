import { derived } from 'svelte/store';

import { syncConnection } from '$services/sync/syncConnection';

const enum ClientTypes {
  validateInvite = 'validateInvite',

  invitationError = 'invitationError',
  invitationResolution = 'invitationResolution',

  joiningError = 'joiningError',
}

export const launchWalletJoin = derived(
    syncConnection,
    $sync => async (data: {
      b64InviteString: string;
      b64InviteSignatureByJoiningUser: string;
      b64PublicECDHKey: string;
    }) => {
      if (!$sync) return;

      $sync.sendMessage({ type: ClientTypes.validateInvite, data });
    },
  ),
  invitationError = derived(
    syncConnection,
    $sync => (data: {
      joiningUserId: string;
      b64InviteSignatureByJoiningUser: string;
      b64InviteString: string;
    }) => {
      if (!$sync) return;

      $sync.sendMessage({ type: ClientTypes.invitationError, data });
    },
  ),
  invitationResolution = derived(
    syncConnection,
    $sync => async (data: {
      allowJoin: boolean;
      joiningUserId: string;
      b64InviteString: string;
      b64InviteSignatureByJoiningUser: string;
    }) => {
      if (!$sync) return;

      return $sync.sendMessage({ type: ClientTypes.invitationResolution, data });
    },
  ),
  joiningError = derived(syncConnection, $sync => (data: { b64InviteString: string }) => {
    if (!$sync) return;

    return $sync.sendMessage({ type: ClientTypes.joiningError, data });
  });
