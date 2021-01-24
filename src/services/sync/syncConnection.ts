import { derived } from 'svelte/store';

import { wsStore, WsStates } from '@/utils/wsStore';

import { tokenStore } from '@/stores/token';

import { wsPath } from '@/services/config';
import {
  userMessagesPrefix,
  userHandleMessages,
  UserBackMessage,
} from '@/services/auth/userWsHandler';
import { TokenService } from '@/services/auth/tokenService';
import { getNewTokenMessage } from '@/services/auth/tokenWsAction';
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

type SyncMessage = {
  type: string;
  data: any;
};

const rawSyncConnection = wsStore(`${wsPath}/sync`, (message: SyncMessage) => {
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

/**
 * It recomputes:
 * 1. when token is changed:
 *    - null -> token — need to be launched
 *    - token -> token — should relaunch the timer and return new patched send function
 *    - token -> null — should stop timer and return null
 * 2. ws connection changes:
 *    - on -> off — should stop timer and return null
 *    - off -> on — should relaunch the timer
 */
let timeout: number;
export const syncConnection = derived([rawSyncConnection, tokenStore], ([$sync, $token]) => {
  if (!$sync) return null;

  clearTimeout(timeout);

  if (!$token || !$token.accessToken || $sync.state !== WsStates.open) return null;

  const { sendMessage } = $sync,
    patchedSendMessage: (message: SyncMessage) => void = ({ type, data }) =>
      sendMessage({ type, data, token: $token.accessToken });

  timeout = window.setTimeout(
    () => getNewTokenMessage(sendMessage, $token),
    TokenService.timeoutToRefreshToken($token.accessToken),
  );

  // We've already set the timer, so new token will be set quite soon, but for now it
  // is too obsolete, we cannot allow all the following stores to operate.
  if (!TokenService.isTokenSafeToUse($token.accessToken)) return null;

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
