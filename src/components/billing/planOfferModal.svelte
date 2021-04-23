<script>
  import Modal from '$components/elements/modal.svelte';

  import { _ } from 'svelte-i18n';
  import Purchase from './purchase.svelte';

  export let planCheck: {
      userCanBuy: boolean;
      planActive: boolean;
    } | null = null,
    showModal: boolean = false;
</script>

<Modal bind:active={showModal}>
  {#if planCheck}
    <h2>{$_('cmps.billing.planGuard.requires')}</h2>
    {#if planCheck.userCanBuy}
      <p>{$_('cmps.billing.planGuard.buyToUse')}</p>
      <hr />
      <Purchase />
    {:else}
      <p>{$_('cmps.billing.planGuard.askOwner')}</p>
    {/if}
  {/if}
</Modal>
