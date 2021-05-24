<script>
  import type { CategorySplitReturn } from '$core/analytics/categorySplitPlugin';
  import type { Dataset } from '$components/charts/bars.svelte';

  import BarChart from '$components/charts/bars.svelte';
  import Tabs from '$components/elements/tabs.svelte';
  import ZeroData from '$components/elements/zeroData.svelte';

  import { _ } from 'svelte-i18n';

  import { currentWalletCategoryStore } from '$stores/decr/category';
  import { NoCategoryObjectKey } from '$core/analytics/categorySplitPlugin';

  // export let prevStats = [];
  export let currStats: CategorySplitReturn['curr'] = [],
    isIncome: boolean;

  // Index 9 of the array means the maximum of 10 categories to be shown
  const categoryShowCountToIndex = 9;

  let limitShows = true;

  const checkIfNoCategory = (id: any) => Object.values(NoCategoryObjectKey).includes(id);

  $: filteredCurr = currStats.filter(stat => {
    if (checkIfNoCategory(stat.id)) {
      return isIncome
        ? stat.id == NoCategoryObjectKey.income
        : stat.id == NoCategoryObjectKey.expense;
    }
    return $currentWalletCategoryStore[stat.id]?.decr.isIncome === isIncome;
  });

  $: labels = filteredCurr
    .slice(0, limitShows ? categoryShowCountToIndex + 1 : Infinity)
    .map((stat, index) => {
      const label = checkIfNoCategory(stat.id)
        ? $_('cmps.category.common.noCategory')
        : $currentWalletCategoryStore[stat.id].decr.name;
      return limitShows && index === categoryShowCountToIndex
        ? $_('cmps.dashboard.categoryChart.rest')
        : label;
    });

  const noCategoryColor = '#d0dbd1',
    restCategoryColor = '#dbd1d0';
  $: dataset = filteredCurr.reduce<Dataset>(
    (acc, stat) => {
      if (limitShows && acc.data.length === categoryShowCountToIndex + 1) {
        acc.backgroundColor[categoryShowCountToIndex] = noCategoryColor;
        acc.borderColor[categoryShowCountToIndex] = noCategoryColor;
        acc.data[categoryShowCountToIndex] += stat.value;
      } else {
        if (checkIfNoCategory(stat.id)) {
          acc.backgroundColor.push(restCategoryColor);
          acc.borderColor.push(restCategoryColor);
          acc.data.push(stat.value);
        } else {
          const { decr: cat } = $currentWalletCategoryStore[stat.id];
          acc.backgroundColor.push(cat.color);
          acc.borderColor.push(cat.color);
          acc.data.push(stat.value);
        }
      }

      return acc;
    },
    { backgroundColor: [], borderColor: [], data: [] },
  );
</script>

<Tabs
  classes="is-toggle is-centered is-small"
  tabs={[
    { value: false, label: $_('cmps.transaction.common.expenses') },
    { value: true, label: $_('cmps.transaction.common.incomes') },
  ]}
  bind:activeTab={isIncome} />

{#if dataset.data.length}
  <BarChart {dataset} {labels} />
{:else}
  <ZeroData text={$_('cmps.dashboard.categoryChart.zeroData')} />
{/if}

{#if filteredCurr.length >= categoryShowCountToIndex + 1}
  <button class="button is-fullwidth is-text" on:click={() => (limitShows = !limitShows)}>
    {#if limitShows}
      {$_('cmps.dashboard.categoryChart.showAll')}
    {:else}{$_('cmps.dashboard.categoryChart.showLess')}{/if}
  </button>
{/if}
