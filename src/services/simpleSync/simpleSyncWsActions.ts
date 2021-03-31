import type { Writable } from 'svelte/store';
import { derived } from 'svelte/store';

import { syncConnection } from '$services/sync/syncConnection';
import { schemeStore } from '$stores/scheme';
import { metaCategoryStore } from '$stores/metaCategory';

const enum ClientTypes {
  getScheme = 'scheme/get',
  getMetaCategory = 'metaCategory/get',
}

const getSyncGenericStore = <T extends { id: string; updated: number }>(
  store: Writable<{ [id: string]: T }>,
  message: ClientTypes,
) => {
  let prevLatestUpdated = -1;

  return derived([syncConnection, store], ([$sync, $state]) => {
    if (!$sync) return;

    const schemes = Object.values($state),
      latestUpdated = schemes.length ? Math.max(...schemes.map(scheme => scheme.updated)) : 0;

    if (prevLatestUpdated != latestUpdated) {
      prevLatestUpdated = latestUpdated;
      return $sync.sendMessage({ type: message, data: { latestUpdated } });
    }
  });
};

export const getAllSchemes = getSyncGenericStore(schemeStore, ClientTypes.getScheme),
  getAllMetaCategories = getSyncGenericStore(metaCategoryStore, ClientTypes.getMetaCategory);
