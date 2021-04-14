import { derived } from 'svelte/store';

import { eventSourceStoreConstructor } from '$utils/eventSourceStore';
import { apiPath } from '$services/config';
import type { UserEncrState } from '$stores/user';
import { userEncrStore } from '$stores/user';
import { AuthService } from './authService';

type UserBackMessage = { type: 'data'; data: UserEncrState };

const userEvents = eventSourceStoreConstructor({
  path: `${apiPath}/auth/user/updates`,
  handler: (message: UserBackMessage) => {
    userEncrStore.set(message.data);
  },
});

export const syncUser = derived([userEncrStore, userEvents], ([$user, $clientId]) => {
  if ($user && $user.clientUpdated && $user.encr && $clientId) {
    AuthService.updateUser({
      encr: $user.encr,
      clientUpdated: $user.clientUpdated,
      clientId: $clientId,
    }).catch(e => console.error('error updating user data', e));
  }
});
