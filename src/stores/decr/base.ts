import { nanoid } from 'nanoid';
import { encode } from 'base64-arraybuffer-es6';
import { writable, derived } from 'svelte/store';

import type { FullEntity, AllEntities, OmitCommonFields } from './types';
import { EntityTypes } from './types';
import { bulkUpdateEncrEntity } from '$stores/encr/store';
import { encryptionService } from '$services/crypto/cryptoService';
import { deriveCurrentEnts } from '$stores/wallet';

type UpdateData<T extends AllEntities> = { ent: FullEntity<T>; decr: T };
export type WalletState<T extends AllEntities> = {
  [id: string]: FullEntity<T>;
};
export type StoreData<T extends AllEntities> = {
  [walletId: string]: WalletState<T>;
};

const v10: [number, number] = [1, 0],
  currentEntityVersions: { [key in EntityTypes]: [number, number] } = {
    [EntityTypes.asset]: v10,
    [EntityTypes.walletData]: v10,
    [EntityTypes.walletUser]: v10,
    [EntityTypes.category]: v10,
    [EntityTypes.searchFilter]: v10,
    [EntityTypes.correctionTransaction]: v10,
    [EntityTypes.referenceTransaction]: v10,
    [EntityTypes.transaction]: v10,
    [EntityTypes.ignoredTransaction]: v10,
    [EntityTypes.deleted]: v10,
  };

export type EntityConsistencyChecker<T extends AllEntities> = (
  ent: FullEntity<T>,
  deletedEntityIds: string[],
) => FullEntity<T> | undefined | null | void;
const deleteAndSetConsistencyStateEntriesByIds = <T extends AllEntities>(
  state: { [id: string]: FullEntity<T> },
  deletedIds: string[],
  consistencyChecker?: EntityConsistencyChecker<T>,
) =>
  Object.values(state).reduce(
    (acc, curr) => {
      // It has been deleted, no need to run additional checks
      if (deletedIds.includes(curr.id)) return (acc.hasChanges = true), acc;

      // This function mutates curr, so no need to do anything additional
      if (consistencyChecker && consistencyChecker(curr, deletedIds)) acc.hasChanges = true;
      return (acc.res[curr.id] = curr), acc;
    },
    { res: {}, hasChanges: false } as {
      res: typeof state;
      hasChanges: boolean;
    },
  );

export const createDecrEntityStore = <T extends AllEntities>(
  type: EntityTypes,
  consistencyChecker?: EntityConsistencyChecker<T>,
) => {
  const store = writable({} as StoreData<T>),
    localOverwrite = (data: Array<FullEntity<T>>) =>
      store.update($state => {
        data.forEach(ent => {
          if (!$state[ent.walletId]) $state[ent.walletId] = {};
          $state[ent.walletId][ent.id] = ent;
        });
        return $state;
      }),
    globalOverwrite = async (data: Array<FullEntity<T>>) => {
      // Encrypting all at once
      const encrArray = await Promise.all(
        data.map(({ decr, id, walletId }) =>
          encryptionService.encrypt({
            data: decr,
            id,
            walletId,
            additionalData: walletId,
          }),
        ),
      );

      // Writing it all at once
      localOverwrite(data);
      bulkUpdateEncrEntity(
        data.map((ent, i) => {
          const { decr, id, walletId, ...other } = ent;
          return {
            id,
            walletId,
            ...other,
            clientUpdated: new Date().getTime(),
            encr: encode(encrArray[i]),
          };
        }),
      );
    },
    createBaseNewEnt = (walletId: string, decrData: OmitCommonFields<T>, now: number) => ({
      id: nanoid(),
      walletId,
      decr: {
        _v: currentEntityVersions[type],
        type,
        created: now,
        updated: now,

        ...decrData,
      } as T,
    }),
    createBaseUpdateEnt = (now: number, { ent, decr }: UpdateData<T>) => {
      decr.updated = now;
      return { ...ent, decr };
    };

  return {
    store,
    currentWalletStore: deriveCurrentEnts(store),
    overwrite: localOverwrite,
    add: async (walletId: string, decrData: OmitCommonFields<T>): Promise<FullEntity<T>> => {
      const ent = createBaseNewEnt(walletId, decrData, new Date().getTime());
      await globalOverwrite([ent]);
      return ent;
    },
    bulkAdd: async (walletId: string, decrData: Array<OmitCommonFields<T>>) => {
      const now = new Date().getTime(),
        ents = decrData.map(ent => createBaseNewEnt(walletId, ent, now));
      await globalOverwrite(ents);
      return ents;
    },
    update: async (data: UpdateData<T>): Promise<FullEntity<T>> => {
      const now = new Date().getTime(),
        ent = createBaseUpdateEnt(now, data);
      await globalOverwrite([ent]);

      return ent;
    },
    bulkUpdate: async (data: UpdateData<T>[]): Promise<FullEntity<T>[]> => {
      const now = new Date().getTime(),
        ents = data.map(ent => createBaseUpdateEnt(now, ent));
      await globalOverwrite(ents);
      return ents;
    },
    deletedDataConsistencyGuardStore: derived(
      store,
      $state => (walletId: string, deletedIds: string[]) => {
        if (!$state[walletId]) return;

        const { hasChanges, res } = deleteAndSetConsistencyStateEntriesByIds(
          $state[walletId],
          deletedIds,
          consistencyChecker,
        );
        if (hasChanges) store.update($state => (($state[walletId] = res), $state));
      },
    ),
  };
};
