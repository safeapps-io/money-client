<script>
  import WalletModalCreate from '$components/wallet/modalCreate.svelte';

  import { runInitialScreenPlanCheck } from '$components/billing/planOfferModal.svelte';
  import { plansStore } from '$stores/billing';

  let active = false;

  $: {
    // We want to rerun the check every time plans change
    $plansStore;
    active = runInitialScreenPlanCheck();
  }
</script>

<WalletModalCreate firstWallet bind:active />
