import { derived } from 'svelte/store';

import { decrypt } from './keys';

import type { EncrEntity, EncrEntityLocal } from '$stores/encr/store';
import { encryptedStore } from '$stores/encr/store';
import type { AllEntities, AllEntitiesAsHash, FullEntity } from '$stores/decr/types';
import { EntityTypes } from '$stores/decr/types';
import { walletDataOverwrite } from '$stores/decr/wallet';
import { searchFilterOverwrite } from '$stores/decr/searchFilter';
import { transactionOverwrite } from '$stores/decr/transaction';
import { deletedOverwrite } from '$stores/decr/deleted';
import { categoryOverwrite } from '$stores/decr/category';
import { encryptionKeysStateStore, initialDecryptionSet } from '$stores/encr/keysState';
import { correctionTransactionOverwrite } from '$stores/decr/correctionTransaction';
import { referenceTransactionOverwrite } from '$stores/decr/referenceTransaction';
import { ignoredTransactionOverwrite } from '$stores/decr/ignoredTransaction';
import { walletUserOverwrite } from '$stores/decr/walletUser';
import { assetOverwrite } from '$stores/decr/asset';

const overwriteByEntityType: {
  [key in EntityTypes]: (data: Array<FullEntity<AllEntitiesAsHash[key]>>) => void;
} = {
  [EntityTypes.walletData]: walletDataOverwrite,
  [EntityTypes.asset]: assetOverwrite,
  [EntityTypes.walletUser]: walletUserOverwrite,
  [EntityTypes.category]: categoryOverwrite,
  [EntityTypes.searchFilter]: searchFilterOverwrite,
  [EntityTypes.correctionTransaction]: correctionTransactionOverwrite,
  [EntityTypes.referenceTransaction]: referenceTransactionOverwrite,
  [EntityTypes.transaction]: transactionOverwrite,
  [EntityTypes.ignoredTransaction]: ignoredTransactionOverwrite,
  [EntityTypes.deleted]: deletedOverwrite,
};

/**
 * Decrypts and saves to corresponding decrypted entity store.
 */
export const setDecryptedFromEncrypted = async (
  encryptedArray: Array<EncrEntity | EncrEntityLocal>,
) => {
  const decrypted = await Promise.all(
      encryptedArray.map(encrEnt =>
        decrypt<AllEntities>(encrEnt.encr, encrEnt.id, encrEnt.walletId, encrEnt.walletId),
      ),
    ),
    dataByEntityType = {} as {
      [key in EntityTypes]: Array<FullEntity<AllEntitiesAsHash[key]>>;
    };

  for (let i = 0; i < decrypted.length; i++) {
    const decr = decrypted[i],
      { encr, ...restOfData } = encryptedArray[i],
      /**
       * TODO: Remove `any`.
       * Unfortunately, need to use `any` here. Compiler understands, that decr is AllEntity, by it
       * fails to understand, that decr is always of needed type based on `decr.type` key.
       *
       * I think, it can be handled, but I don't want to waster time on fighthing this battle today.
       */
      decrEnt = { ...restOfData, decr: decr as any };

    if (!dataByEntityType[decr.type]) dataByEntityType[decr.type] = [];

    dataByEntityType[decr.type].push(decrEnt);
  }

  /**
   * TODO: Remove `any`.
   * Same thing goes here. The code above groups entities by type, but when we're iterating on
   * `dataByEntityType`, it loses the types behind this grouping — both keys and values.
   * While it's easy to cast keys, it is not so easy to case this dynamic data array type.
   */
  Object.entries(dataByEntityType).forEach(([type, dataArr]) =>
    overwriteByEntityType[type as EntityTypes](dataArr as any),
  );
};

/**
 * Store that decrypts all the data, when you initially set the password.
 */
export const initialDecryption = derived(
  [encryptionKeysStateStore, encryptedStore],
  async ([$encryptionStates, $encrypted]) => {
    if (
      !$encryptionStates.walletKeysSet ||
      $encryptionStates.initialDecryptionFinished ||
      !$encrypted
    )
      return;

    await setDecryptedFromEncrypted(Object.values($encrypted));
    initialDecryptionSet(true);
  },
);
