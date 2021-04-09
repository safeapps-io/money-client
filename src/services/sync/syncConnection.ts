import { derived } from 'svelte/store';

import { WsStates, wsStore } from '$utils/wsStore';

import { wsPath } from '$services/config';
import type { UserBackMessage } from '$services/auth/userWsHandler';
import { userMessagesPrefix, userHandleMessages } from '$services/auth/userWsHandler';
import type { WalletBackMessage } from '$services/wallet/walletWsHandler';
import { walletMessagesPrefix, walletHandleMessages } from '$services/wallet/walletWsHandler';
import type { SyncBackMessage } from './syncWsHandler';
import { syncMessagesPrefix, syncHandleMessages } from './syncWsHandler';
import type { MccBackMessage } from '$services/mcc/mccWsHandler';
import { mccMessagesPrefix, mccHandleMessages } from '$services/mcc/mccWsHandler';
import type { InviteBackMessage } from '$services/invite/inviteWsHandler';
import { inviteHandleMessages, inviteMessagesPrefix } from '$services/invite/inviteWsHandler';
import type { SimpleSyncBackMessage } from '$services/simpleSync/simpleSyncWsHandler';
import {
  simpleSyncHandleMessages,
  simpleSyncMessagesPrefixes,
} from '$services/simpleSync/simpleSyncWsHandler';
import { AuthService } from '$services/auth/authService';
import type { BillingBackMessage } from '$services/billing/billingWsHandler';
import { billingHandleMessages, billingMessagesPrefix } from '$services/billing/billingWsHandler';

type SyncMessage = {
  type: string;
  data: any;
};

const ticketGetter = () =>
  AuthService.getWsTicket()
    .then(ticket => `${wsPath}/sync/${ticket}/`)
    .catch(() => {});

const rawSyncConnection = wsStore(ticketGetter, (message: SyncMessage) => {
  const startsWith = (prefix: string) => message.type.startsWith(prefix);

  switch (true) {
    case startsWith(userMessagesPrefix):
      userHandleMessages(message as UserBackMessage);
      break;

    case startsWith(walletMessagesPrefix):
      walletHandleMessages(message as WalletBackMessage);
      break;

    case startsWith(syncMessagesPrefix):
      syncHandleMessages(message as SyncBackMessage);
      break;

    case startsWith(mccMessagesPrefix):
      mccHandleMessages(message as MccBackMessage);
      break;

    case startsWith(inviteMessagesPrefix):
      inviteHandleMessages(message as InviteBackMessage);
      break;

    case startsWith(billingMessagesPrefix):
      billingHandleMessages(message as BillingBackMessage);
      break;

    case simpleSyncMessagesPrefixes.some(pref => startsWith(pref)):
      simpleSyncHandleMessages(message as SimpleSyncBackMessage);
      break;
  }
});

export const syncConnection = derived(rawSyncConnection, $sync => {
  if (!$sync || $sync.state !== WsStates.open) return null;

  const { sendMessage } = $sync,
    patchedSendMessage: (message: SyncMessage) => void = ({ type, data }) =>
      sendMessage({ type, data });

  return { ...$sync, sendMessage: patchedSendMessage };
});

/**
 * `syncConnectionStore` is updated kind of often for many use cases. This method will help
 * you to check if some other intermediate state has been changed.
 */
export const stateChangeHappen = <T extends Object>(curr: T, prev?: T | null): boolean =>
  !prev ||
  !(
    Object.keys(prev).length === Object.keys(curr).length &&
    Object.entries(prev)
      .map(([key, value]) => curr[key as keyof typeof curr] === value)
      .every(Boolean)
  );
