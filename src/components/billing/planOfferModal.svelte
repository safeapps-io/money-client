<script context="module">
  import { get, writable } from 'svelte/store';
  import { planGuardStore } from '$stores/billing';

  type CheckMode = 'user' | 'wallet';

  const stateStore = writable<{
    checkMode: CheckMode;
    showModal: boolean;
    userCanBuy: boolean;
  }>({ checkMode: 'wallet', showModal: false, userCanBuy: false });

  /**
   * We can run one of three checks here.
   * 'user' — we check if current user has a subscription;
   * 'wallet' — we check if current wallet has a subcription;
   */
  const runCheck = (checkMode: CheckMode, e?: Event) => {
    const planGuard = get(planGuardStore),
      { userCanBuy, planActive } = planGuard(checkMode == 'user');

    stateStore.set({
      checkMode,
      userCanBuy,
      showModal: !planActive,
    });

    // Useful for links and other clickable stuff
    if (!planActive && e) {
      e.preventDefault();
      e.stopPropagation();
    }

    return planActive;
  };

  export const runCurrentUserPlanCheck = (e?: Event) => runCheck('user', e),
    runCurrentWalletPlanCheck = (e?: Event) => runCheck('wallet', e);
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
