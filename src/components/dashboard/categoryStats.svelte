<script>
  import type { BarChartDataset } from '$components/chart/types';
  import type { CategorySplitReturn } from '$core/analytics/categorySplitPlugin';

  import HorizontalBar from '$components/chart/horizontalBar.svelte';
  import Tabs from '$components/elements/tabs.svelte';
  import ZeroData from '$components/elements/zeroData.svelte';

  import { _ } from 'svelte-i18n';

  import { moneyFormat } from '$utils/number';

  import { currentWalletCategoryStore } from '$stores/decr/category';
  import { NoCategoryObjectKey } from '$core/analytics/categorySplitPlugin';
  import { defaultAssetStore } from '$stores/decr/asset';

  // export let prevStats = [];
  export let currStats: CategorySplitReturn['curr'] = [],
    isIncome: boolean;

  // Max amount of categories to be shown. All the rest will be dumped into a single category.
  const countCategoriesToShow = 6;
  let limitShows = true;

  const checkIfNoCategory = (id: any) => Object.values(NoCategoryObjectKey).includes(id);

  $: isIncomeFiltered = currStats.filter(stat => {
    if (checkIfNoCategory(stat.id)) {
      return isIncome
        ? stat.id == NoCategoryObjectKey.income
        : stat.id == NoCategoryObjectKey.expense;
    }
    return $currentWalletCategoryStore[stat.id]?.decr.isIncome === isIncome;
  });

  const noCategoryColor = '#d0dbd1',
    restCategoryColor = '#dbd1d0';

  let data: BarChartDataset = [];
  $: {
    data = [];
    for (const datapoint of isIncomeFiltered) {
      if (limitShows && data.length == countCategoriesToShow) {
        data[countCategoriesToShow - 1] = {
          color: restCategoryColor,
          id: '',
          label: $_('cmps.dashboard.categoryChart.rest'),
          value: data[countCategoriesToShow - 1].value + datapoint.value,
        };
      } else {
        if (checkIfNoCategory(datapoint.id))
          data.push({
            ...datapoint,
            color: noCategoryColor,
            label: $_('cmps.category.common.noCategory'),
          });
        else {
          const { decr: cat } = $currentWalletCategoryStore[datapoint.id];
          data.push({ ...datapoint, color: cat.color, label: cat.name });
        }
      }
    }
  }

  $: displayValue = (val: number) => $moneyFormat(val, $defaultAssetStore.decr.code);
</script>

<Tabs
  classes="is-toggle is-centered is-small"
  tabs={[
    { value: false, label: $_('cmps.transaction.common.expenses') },
    { value: true, label: $_('cmps.transaction.common.incomes') },
  ]}
  bind:activeTab={isIncome} />

{#if data.length}
  <HorizontalBar {data} {displayValue} />
{:else}
  <ZeroData text={$_('cmps.dashboard.categoryChart.zeroData')} />
{/if}

{#if isIncomeFiltered.length > countCategoriesToShow}
  <button class="button is-fullwidth is-text" on:click={() => (limitShows = !limitShows)}>
    {#if limitShows}
      {$_('cmps.dashboard.categoryChart.showAll')}
    {:else}{$_('cmps.dashboard.categoryChart.showLess')}{/if}
  </button>
{/if}
