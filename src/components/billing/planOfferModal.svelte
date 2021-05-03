<script context="module">
  import type { PlanFull } from '$stores/billing';

  import { get, writable } from 'svelte/store';
  import { planGuardStore } from '$stores/billing';

  type CheckMode = 'user' | 'wallet' | 'user:initialScreen';

  const stateStore = writable<{
    checkMode: CheckMode;
    showModal: boolean;
    userCanBuy: boolean;
  }>({ checkMode: 'wallet', showModal: false, userCanBuy: false });

  /**
   * We can run one of three checks here.
   * 'user' — we check if current user has a subscription;
   * 'wallet' — we check if current wallet has a subcription;
   * 'user:initialScreen' — same as 'user', but also we adapt the UI for the onboarding.
   */
  const runCheck = (checkMode: CheckMode, e?: Event) => {
    const planGuard = get(planGuardStore),
      { userCanBuy, planActive } = planGuard(checkMode.startsWith('user'));

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
    runCurrentWalletPlanCheck = (e?: Event) => runCheck('wallet', e),
    runInitialScreenPlanCheck = (e?: Event) => runCheck('user:initialScreen', e);
</script>

<script>
  import Modal from '$components/elements/modal.svelte';
  import LoadingBlock from '$components/elements/loadingBlock.svelte';
  import Purchase from './purchase.svelte';

  import { _ } from 'svelte-i18n';

  import { BillingService } from '$services/billing/billingService';

  let plan: PlanFull | null = null;
</script>

{#if $stateStore.checkMode === 'user:initialScreen'}
  <Modal bind:active={$stateStore.showModal} canBeVoluntarilyClosed={false} noBox forceScale>
    <LoadingBlock
      fetchData={async () => !plan && BillingService.getPlan().then(({ json }) => (plan = json))}>
      {#if plan}
        <div class="is-flex">
          <div class="price-wrapper py-3 px-5">
            <p class="price">
              ${plan.product.price / 100}<span class="duration"
                >/{$_('cmps.searchFilter.period.year')}</span>
            </p>
            <p class="is-size-7">{$_('cmps.billing.providers.moneyback')}</p>
          </div>
        </div>
      {/if}
      <Purchase />
    </LoadingBlock>
  </Modal>
{:else}
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
{/if}

<style lang="scss">
  .price-wrapper {
    margin: 1em auto;

    text-align: center;
    background: linear-gradient(130deg, hsl(110, 50%, 50%), hsl(167, 80%, 35%));
    color: white;
    border-radius: 0.5em;
  }

  .price {
    font-weight: bold;
    font-size: 3rem;

    .duration {
      font-size: 1.5rem;
      text-transform: lowercase;
    }
  }
</style>
