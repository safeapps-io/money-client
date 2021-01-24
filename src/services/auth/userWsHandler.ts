import { userEncrStore, UserEncrState } from '@/stores/user';
import { setAccessToken } from '@/stores/token';

const enum BackTypes {
  data = 'user/data',
  newAccessToken = 'user/newAccessToken',
}
export type UserBackMessage =
  | { type: BackTypes.data; data: UserEncrState }
  | { type: BackTypes.newAccessToken; data: string };

export const userMessagesPrefix = 'user',
  userHandleMessages = (message: UserBackMessage) => {
    switch (message.type) {
      case BackTypes.data: {
        userEncrStore.set(message.data);
        break;
      }

      case BackTypes.newAccessToken: {
        setAccessToken(message.data);
        break;
      }
    }
  };
