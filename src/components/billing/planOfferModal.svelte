<script context="module">
  import { get, writable } from 'svelte/store';
  import { planGuardStore } from '$stores/billing';

  const stateStore = writable<{
    showModal: boolean;
    userCanBuy: boolean;
  }>({ showModal: false, userCanBuy: false });

  /**
   * We can run one of three checks here.
   * 'user' — we check if current user has a subscription;
   * 'wallet' — we check if current wallet has a subcription;
   */
  export const runCheck = (e?: Event) => {
    const { userCanBuy, isActive } = get(planGuardStore);

    stateStore.set({
      userCanBuy,
      showModal: !isActive,
    });

    // Useful for links and other clickable stuff
    if (!isActive && e) {
      e.preventDefault();
      e.stopPropagation();
    }

    return isActive;
  };
</script>

<script>
  import Modal from '$components/elements/modal.svelte';
  import Purchase from './purchase.svelte';

  import { _ } from 'svelte-i18n';
</script>

<Modal bind:active={$stateStore.showModal}>
  <h2>{$_('cmps.billing.planGuard.requires')}</h2>
  {#if $stateStore.userCanBuy}
    <p>{$_('cmps.billing.planGuard.buyToUse')}</p>
    <hr />
    <Purchase />
  {:else}
    <p>{$_('cmps.billing.planGuard.askOwner')}</p>
  {/if}
</Modal>
