import { WsSendMessage } from '@/utils/wsStore';
import { TokenState } from '@/stores/token';

const enum ClientTypes {
  newAccessToken = 'user/newAccessToken',
}

export const getNewTokenMessage = (sendMessage: WsSendMessage, tokens: TokenState) =>
  sendMessage({ type: ClientTypes.newAccessToken, data: tokens });
