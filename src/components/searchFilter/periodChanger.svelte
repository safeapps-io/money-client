<script>
  import Dropdown from '$components/elements/dropdown/generic.svelte';

  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { focusableShortcut } from '$utils/actions/shortcut';
  import { getMonthName } from '$utils/date';

  import { SearchFilterDatePeriods } from '$stores/decr/types';
  import { relativeDate } from '$core/i18n/relativeDate';

  export let group: SearchFilterDatePeriods,
    dates: {
      startDate: number;
      endDate: number;
      prevStartDate?: number | undefined;
    },
    page: number;

  $: disablePeriods = group === SearchFilterDatePeriods.all;

  $: choices = [
    { label: $_('cmps.searchFilter.period.month'), value: SearchFilterDatePeriods.month },
    { label: $_('cmps.searchFilter.period.quarter'), value: SearchFilterDatePeriods.quarter },
    { label: $_('cmps.searchFilter.period.year'), value: SearchFilterDatePeriods.year },
    { label: $_('cmps.searchFilter.period.alltime'), value: SearchFilterDatePeriods.all },
  ];
  $: filteredChoices = choices.filter(({ value }) => value != group);

  let buttonText: string,
    periodDescription: string | null = null;
  $: {
    if (group != SearchFilterDatePeriods.quarter) periodDescription = null;

    switch (group) {
      case SearchFilterDatePeriods.all:
        buttonText = $_('cmps.searchFilter.period.alltime');
        break;

      case SearchFilterDatePeriods.month:
        buttonText = $getMonthName(new Date(dates.startDate));
        break;

      case SearchFilterDatePeriods.year:
        buttonText = new Date(dates.startDate).getFullYear().toString();
        break;

      case SearchFilterDatePeriods.quarter:
        buttonText = $_('cmps.searchFilter.period.quarter');
        periodDescription = `${$relativeDate(dates.startDate)} → ${$relativeDate(dates.endDate)}`;
    }
  }
</script>

<div class="is-flex flex-centered">
  <button class="button is-light" on:click={() => page++} disabled={disablePeriods}>
    {'<'}
  </button>
  <div class="has-text-centered mx-3">
    <Dropdown triggerText={buttonText} centered>
      {#each filteredChoices as { value, label } (value)}
        <div
          class="dropdown-item"
          on:click={() => (group = value)}
          role="button"
          tabindex="0"
          use:focusableShortcut>
          {label}
        </div>
      {/each}
    </Dropdown>

    {#if periodDescription}
      <div class="is-size-7" transition:slide|local>{periodDescription}</div>
    {/if}
  </div>
  <button class="button is-light" disabled={disablePeriods || page === 0} on:click={() => page--}>
    {'>'}
  </button>
</div>
