import { derived } from 'svelte/store';

import { syncConnection } from '$services/sync/syncConnection';
import { mccStore } from '$stores/mcc';

const enum ClientTypes {
  get = 'mcc/get',
}

export const getMccDescription = derived(
  [syncConnection, mccStore],
  ([$sync, $mcc]) => (code: string) => {
    if (!$sync) return;

    const localState = $mcc?.[code];
    return typeof localState === 'string'
      ? localState
      : $sync.sendMessage({ type: ClientTypes.get, data: { codeList: [code] } });
  },
);
