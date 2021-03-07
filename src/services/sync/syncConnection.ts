import { derived } from 'svelte/store';

import { WsStates, wsStore } from '@/utils/wsStore';

import { wsPath } from '@/services/config';
import {
  userMessagesPrefix,
  userHandleMessages,
  UserBackMessage,
} from '@/services/auth/userWsHandler';
import {
  walletMessagesPrefix,
  walletHandleMessages,
  WalletBackMessage,
} from '@/services/wallet/walletWsHandler';
import { SyncBackMessage, syncMessagesPrefix, syncHandleMessages } from './syncWsHandler';
import { mccMessagesPrefix, mccHandleMessages, MccBackMessage } from '@/services/mcc/mccWsHandler';
import {
  inviteHandleMessages,
  inviteMessagesPrefix,
  InviteBackMessage,
} from '@/services/invite/inviteWsHandler';
import {
  SimpleSyncBackMessage,
  simpleSyncHandleMessages,
  simpleSyncMessagesPrefixes,
} from '@/services/simpleSync/simpleSyncWsHandler';
import { AuthService } from '@/services/auth/authService';

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
