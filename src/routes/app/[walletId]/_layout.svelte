<script>
  import Meta from '@/components/nav/meta.svelte';

  import { stores } from '@sapper/app';

  import { setUserSelectedWallet } from '@/stores/wallet';
  import { currentWalletDataStore } from '@/stores/decr/wallet';
  import { debugLog } from '@/core/logger';

  const { page } = stores();

  $: ({ walletId } = $page.params);

  $: {
    debugLog('[wallet layout] updating selected stores', { walletId });
    setUserSelectedWallet(walletId);
  }
</script>

<Meta title={`[💰] ${$currentWalletDataStore?.decr.name || ''}`} />

<slot />
