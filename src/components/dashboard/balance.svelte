<script>
  import BalanceChart from './charts/balance.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { media } from 'svelte-match-media';

  import { focusableShortcut } from '$utils/actions/shortcut';
  import { moneyFormat, percentFormat } from '$utils/number';

  import { defaultAssetStore } from '$stores/decr/asset';

  // Undefined if there is not balance at all at this point (time before first transaction)
  export let balanceNumber: number | undefined,
    balanceComparison: number | undefined = undefined,
    // Stores a sorted (old -> new) history of all the balance positions from the very beginning
    balanceHistory: {
      date: Date;
      value: number;
    }[] = [];

  const dispatch = createEventDispatcher(),
    isPlanActive = getContext('isPlanActive')(),
    adaptToChart = (history: typeof balanceHistory) =>
      history.map(({ date, value }) => ({ t: new Date(date), y: value }));

  $: percentage = balanceNumber ? balanceNumber / (balanceComparison ?? balanceNumber) - 1 : null;
</script>

<div class="level is-mobile">
  <div class="level-left">
    <div class="level-item"><strong>{$_('cmps.dashboard.balanceChart')}</strong></div>
  </div>
  <div class="level-right">
    {#if balanceNumber}
      <div class="level-item">
        <div
          class="has-text-dotted clickable has-text-link is-size-7"
          role="button"
          tabindex="0"
          on:click={() => isPlanActive() && dispatch('correctBalance')}
          use:focusableShortcut>
          {$_(
            $media.mobile
              ? 'cmps.transaction.correction.correctShort'
              : 'cmps.transaction.correction.correctFull',
          )}
        </div>
      </div>
    {/if}

    <!-- 
      1. null, if it is all time stats
      2. 0 — most probably, there was no previous period at all
    -->
    {#if percentage}
      <div class="level-item">
        <p class:has-text-danger={percentage < 0} class:has-text-success={percentage >= 0}>
          {$percentFormat(percentage)}
        </p>
      </div>
    {/if}
    <div class="level-item">
      {#if balanceNumber}{$moneyFormat(balanceNumber, $defaultAssetStore.decr.code)}{:else}N/A{/if}
    </div>
  </div>
</div>
{#if balanceNumber}
  <div transition:slide|local>
    <BalanceChart data={adaptToChart(balanceHistory)} />
  </div>
{/if}
