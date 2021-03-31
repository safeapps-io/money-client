import type { UserEncrState } from '$stores/user';
import { userEncrStore } from '$stores/user';

const enum BackTypes {
  data = 'user/data',
}
export type UserBackMessage = { type: BackTypes.data; data: UserEncrState };

export const userMessagesPrefix = 'user',
  userHandleMessages = (message: UserBackMessage) => {
    switch (message.type) {
      case BackTypes.data: {
        userEncrStore.set(message.data);
        break;
      }
    }
  };
