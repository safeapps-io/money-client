import { EncrEntity, encryptedStore } from '@/stores/encr/store';
import { EncryptionKeysState, encryptionKeysStateStore } from '@/stores/encr/keysState';
import { setDecryptedFromEncrypted } from '@/services/crypto/setDecryptedData';

let encryptionKeysState: EncryptionKeysState;
encryptionKeysStateStore.subscribe($state => (encryptionKeysState = $state));

export const bulkSetEncrEntities = (ents: EncrEntity[]) =>
    encryptedStore.update($state => {
      const s = $state || {};
      ents.forEach(ent => (s[ent.id] = ent));

      /**
       * This method is called from sync when a chunk of data comes from backend.
       *
       * When initial decryption has not been finished yet, the data would be set centrally in
       * other place.
       * But when initial decryption is finished, we need to inform the decrypter, that
       * some new data has arrived.
       */
      if (encryptionKeysState.initialDecryptionFinished) setDecryptedFromEncrypted(ents);

      return s;
    }),
  bulkDeleteEncrEntities = (entIds: string[]) =>
    encryptedStore.update($state => {
      entIds.forEach(id => delete $state![id]);
      return $state;
    });
