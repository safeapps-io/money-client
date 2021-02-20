import { Writable } from 'svelte/store';

import { MetaCategory, metaCategoryStore } from '@/stores/metaCategory';
import { schemeStore } from '@/stores/scheme';
import { SimpleScheme } from '@/core/import/types';

const enum BackTypes {
  provideScheme = 'scheme/provide',
  provideMetaCategory = 'metaCategory/provide',
}

export type SimpleSyncBackMessage =
  | {
      type: BackTypes.provideScheme;
      data: SimpleScheme[];
    }
  | {
      type: BackTypes.provideMetaCategory;
      data: MetaCategory[];
    };

const handleMessage = <T extends { id: string }>(
  store: Writable<{ [id: string]: T }>,
  data: T[],
) => {
  store.update($state =>
    data.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, $state),
  );
};

export const simpleSyncMessagesPrefixes = ['scheme', 'metaCategory'],
  simpleSyncHandleMessages = (message: SimpleSyncBackMessage) => {
    switch (message.type) {
      case BackTypes.provideScheme:
        handleMessage(schemeStore, message.data);
        break;

      case BackTypes.provideMetaCategory:
        handleMessage(metaCategoryStore, message.data);
        break;
    }
  };
