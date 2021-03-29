<script>
  import Meta from '@/components/nav/meta.svelte';

  import { page } from '$app/stores';

  import { setUserSelectedWallet } from '@/stores/wallet';
  import { currentWalletDataStore } from '@/stores/decr/wallet';
  import { debugLog } from '@/core/logger';

  $: ({ walletId } = $page.params);

  $: {
    debugLog('[wallet layout] updating selected stores', { walletId });
    setUserSelectedWallet(walletId);
  }
</script>

<Meta title={`[💰] ${$currentWalletDataStore?.decr.name || ''}`} />

<slot />
