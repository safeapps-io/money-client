<script context="module">
  export const controlFinanceId = 1,
    manageFamilyBudgetId = 2,
    payoffDebtId = 3,
    assetManagementId = 4,
    longTermId = 5;
</script>

<script>
  import { createEventDispatcher } from 'svelte';

  import Tooltip from '$components/elements/tooltip.svelte';

  import { _ } from 'svelte-i18n';

  import { memoize } from '$utils/memoize';
  import { delay } from '$utils/delay';

  const dispatch = createEventDispatcher();

  const problems = [
    { id: controlFinanceId, text: $_('cmps.billing.onboarding.problems.control') },
    { id: manageFamilyBudgetId, text: $_('cmps.billing.onboarding.problems.family') },
    { id: payoffDebtId, text: $_('cmps.billing.onboarding.problems.debt') },
    {
      id: assetManagementId,
      text: $_('cmps.billing.onboarding.problems.asset.title'),
      tooltipText: $_('cmps.billing.onboarding.problems.asset.tooltip'),
    },
    {
      id: longTermId,
      text: $_('cmps.billing.onboarding.problems.long.title'),
      tooltipText: $_('cmps.billing.onboarding.problems.long.tooltip'),
    },
  ];

  const iconSize = 17,
    { memoized: contains } = memoize((arr: number[], id?: number) => arr.includes(id!)),
    click = (id: number) => {
      if (contains(checked, id)) checked = checked.filter(val => val != id);
      else checked = [...checked, id];
    },
    next = async () => {
      loading = true;
      await delay(2000);
      dispatch('problems', checked);
    };

  let checked: number[] = [],
    loading = false;
</script>

<div class="has-text-centered">
  <h1 class="subtitle">{$_('cmps.billing.onboarding.problems.title')}</h1>

  <div class="my-6 p-6 buttons problems">
    {#each problems as { text, tooltipText, id } (id)}
      <div class="px-1">
        <Tooltip showTooltip={contains(checked, id) && !!tooltipText}>
          <svelte:fragment slot="trigger">
            <button
              class="button"
              class:is-success={contains(checked, id) && !tooltipText}
              class:is-warning={contains(checked, id) && tooltipText}
              on:click={() => click(id)}>
              <span class="icon">
                {#if contains(checked, id)}
                  {#if tooltipText}
                    <svg viewBox="0 0 15 15" fill="none" width={iconSize} height={iconSize}
                      ><path
                        d="M7.5 7.5H7a.5.5 0 00.146.354L7.5 7.5zm0 6.5A6.5 6.5 0 011 7.5H0A7.5 7.5 0 007.5 15v-1zM14 7.5A6.5 6.5 0 017.5 14v1A7.5 7.5 0 0015 7.5h-1zM7.5 1A6.5 6.5 0 0114 7.5h1A7.5 7.5 0 007.5 0v1zm0-1A7.5 7.5 0 000 7.5h1A6.5 6.5 0 017.5 1V0zM7 3v4.5h1V3H7zm.146 4.854l3 3 .708-.708-3-3-.708.708z"
                        fill="currentColor" /></svg>
                  {:else}
                    <svg viewBox="0 0 15 15" fill="none" width={iconSize} height={iconSize}
                      ><path
                        d="M4 7.5L7 10l4-5m-3.5 9.5a7 7 0 110-14 7 7 0 010 14z"
                        stroke="currentColor" /></svg
                    >{/if}
                {:else}
                  <svg viewBox="0 0 15 15" fill="none" width={iconSize} height={iconSize}
                    ><path
                      d="M7.5 4v7M4 7.5h7m-3.5 7a7 7 0 110-14 7 7 0 010 14z"
                      stroke="currentColor" /></svg>
                {/if}
              </span>
              <span>{text}</span>
            </button>
          </svelte:fragment>

          <p>{tooltipText}</p>
        </Tooltip>
      </div>
    {/each}
  </div>

  <p class="help mb-2 optimizing" class:show={loading}>
    {$_('cmps.billing.onboarding.problems.optimize')}
  </p>

  <button
    class="button is-dark mb-3"
    class:is-color-loading={loading}
    class:is-outlined={!checked.length}
    disabled={!checked.length || loading}
    on:click={next}>{$_('common.next')}</button>

  <p class="help">
    {$_('cmps.billing.onboarding.problems.forPersonalization')}
  </p>
</div>

<style lang="scss">
  .problems {
    @include mq($from: tablet) {
      width: 70%;
      margin: 0 auto;
    }
    place-content: center;

    .button {
      transition: all ease-in-out 0.2s !important;

      $transition-size: 2px;
      $shadow: $transition-size * 2 $transition-size * 2 0 0;

      &:hover {
        transform: translate(-$transition-size, -$transition-size);
        box-shadow: $shadow $green;
      }

      &.is-success:hover,
      &.is-warning:hover {
        box-shadow: $shadow $turquoise;
      }
    }
  }

  .optimizing {
    transition: opacity 0.2s ease-in;
    opacity: 0;

    &.show {
      opacity: 1;
    }
  }

  .is-dark {
    transition: all ease-in-out 0.3s !important;
  }
</style>
