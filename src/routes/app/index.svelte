<script>
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';

  import { appPath, rootJointWalletPath, rootWalletPath } from '@/core/routes';
  import { walletStore, selectedWalletStore, selectedJointWalletStore } from '@/stores/wallet';
  import { debugLog } from '@/core/logger';

  const walletId = $selectedWalletStore,
    jointWalletId = $selectedJointWalletStore;

  /**
   * Either going to pre-selected and cached wallets or to the first in list.
   * Does not do anything smart about checking whether user has access to this wallet.
   *
   * 1. trying saved `selectedWalletStore`
   * 2. trying saved `selectedJointWalletStore`
   * 3. trying to get a fallback wallet
   * 3.1. we have it
   * 3.1.1. it has a default search — we go there
   * 3.1.2. it does not have a default search — launch 100ms timer to do the same procedure
   * 3.2. we do not have it — launch 100ms timer to do the same procedure
   *
   * You shouldn't add reactiveness here, because for some reason it backfires ON PRODUCTION
   * and prevents user from going from `/user/` to `/[walletId]/` without strange blinks.
   * I spent a whole day on debugging it and just gave up.
   */
  let timer = 0;

  const handleVisit = () => {
    if (walletId) {
      debugLog('[app index] redirecting to wallet', { walletId, jointWalletId });
      goto($rootWalletPath(walletId));
    } else if (jointWalletId) {
      debugLog('[app index] redirecting to joint wallet', { walletId, jointWalletId });
      goto($rootJointWalletPath(jointWalletId));
    } else {
      const fallbackWalletId = Object.keys($walletStore || {})[0];
      if (fallbackWalletId) {
        const path = $rootWalletPath(fallbackWalletId);
        if (path != appPath) {
          debugLog('[app index] redirecting to fallback wallet', {
            walletId,
            jointWalletId,
            fallbackWalletId,
          });
          goto($rootWalletPath(fallbackWalletId));
        } else {
          debugLog('[app index] no default search yet');
          window.setTimeout(handleVisit, 100);
        }
      } else {
        debugLog('[app index] have no wallets yet');
        window.setTimeout(handleVisit, 100);
      }
    }
  };

  handleVisit();

  onDestroy(() => clearTimeout(timer));
</script>
