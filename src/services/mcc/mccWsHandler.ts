import { updateMccDescriptions } from '@/stores/mcc';

const enum BackTypes {
  provide = 'mcc/provide',
}

export type MccBackMessage = {
  type: BackTypes.provide;
  data: {
    code: string;
    description: string | null;
  }[];
};

export const mccMessagesPrefix = 'mcc',
  mccHandleMessages = (message: MccBackMessage) => {
    switch (message.type) {
      case BackTypes.provide:
        updateMccDescriptions(message.data);
        break;
    }
  };
