<script>
  import { slide } from 'svelte/transition';

  import { planGuardStore } from '$stores/billing';
  import { userBillingPath } from '$core/routes';

  let displayRemaining: null | number = null,
    state: 'ok' | 'warn' | 'bad',
    userCanBuy: boolean;

  $: planState = $planGuardStore;
  $: if (!planState.count || !planState.limit) displayRemaining = null;
  else {
    userCanBuy = planState.userCanBuy;
    const { limit, count, isActive } = planState;

    if (isActive) {
      state = limit * 0.8 > count ? 'ok' : 'warn';
      displayRemaining = limit - count;
    } else {
      state = 'bad';
      displayRemaining = 0;
    }
  }
</script>

{#if displayRemaining !== null}
  <p
    class="py-1 px-3 is-size-7 has-text-centered"
    class:has-background-warning-light={state == 'warn'}
    class:has-background-success-light={state == 'ok'}
    class:has-background-danger-light={state == 'bad'}
    transition:slide|local>
    <!-- FIXME: translations -->
    {displayRemaining} remaining

    {#if userCanBuy}
      <br />
      <a href={userBillingPath}>Click here to upgrade service</a>
    {/if}
  </p>
{/if}
