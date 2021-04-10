<script>
  import Modal from '$components/elements/modal.svelte';
  import Purchase from './purchase.svelte';

  import { _ } from 'svelte-i18n';

  import { AccessLevels, currentWalletStore } from '$stores/wallet';
  import { userEncrStore } from '$stores/user';
  import { isSubscriptionActiveStore } from '$stores/billing';

  /**
   * Usually we check if current wallet's owner has a subscription. It's a
   * more popular requirement.
   *
   * But in some cases we need to check if current user has it. This flag
   * enables this exact check over wallet's owner check.
   */
  export let currentUserCheck = false;

  let planExpired: boolean, canOfferToMakePurchase: boolean;
  $: if (currentUserCheck) {
    canOfferToMakePurchase = true;
    planExpired = $isSubscriptionActiveStore;
  } else {
    if ($currentWalletStore) {
      const { id, plans } = $currentWalletStore.users.find(
        user => user.WalletAccess.accessLevel == AccessLevels.owner,
      )!;
      canOfferToMakePurchase = id == $userEncrStore!.id;
      planExpired = !plans.some(plan => plan.expires && plan.expires > new Date().getTime());
    }
  }

  let showModal = false;
</script>

<Modal bind:active={showModal}>
  <h2>{$_('cmps.billing.planGuard.requires')}</h2>
  {#if canOfferToMakePurchase}
    <p>{$_('cmps.billing.planGuard.buyToUse')}</p>
    <hr />
    <Purchase />
  {:else}
    <p>{$_('cmps.billing.planGuard.askOwner')}</p>
  {/if}
</Modal>

<div class="is-relative">
  <div class:no-clicks={planExpired}>
    <slot />
  </div>
  {#if planExpired}
    <div class="fullwidth-overlay" on:click={() => (showModal = true)} />
  {/if}
</div>

<style lang="scss">
  .no-clicks {
    pointer-events: none;
  }
</style>
