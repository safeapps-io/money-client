import type { EncrEntity, EncrEntityLocal } from '$stores/encr/store';

export type ClientChangesData = {
  [walletId: string]: {
    entities: Array<EncrEntity | EncrEntityLocal>;
    latestUpdated: number;
  };
};
