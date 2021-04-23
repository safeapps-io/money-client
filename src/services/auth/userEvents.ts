import { derived } from 'svelte/store';

import type { UserEncrState } from '$stores/user';
import { userEncrStore } from '$stores/user';
import { AuthService } from './authService';
import { isOnlineStore } from '$stores/isOnline';

export const userEventsMap = new Map([
  ['user/data', (data: UserEncrState) => userEncrStore.set(data)],
]);

export const syncUser = derived([isOnlineStore, userEncrStore], ([$isOnline, $user]) => {
  if ($isOnline && $user?.clientUpdated && $user.encr) {
    AuthService.updateUser({
      encr: $user.encr,
      clientUpdated: $user.clientUpdated,
    }).catch(e => console.error('error updating user data', e));
  }
});
