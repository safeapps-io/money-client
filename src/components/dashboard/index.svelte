<script context="module">
  import { writable } from 'svelte/store';

  const resetPageKeyStore = writable<string | null>(null);
</script>

<script>
  import type { SearchFilter, FullEntity } from '$stores/decr/types';

  import Page from '$components/nav/page.svelte';
  import DashboardAnalytics from '$components/dashboard/analytics.svelte';
  import SearchFilterReactiveForm from '$components/dashboard/reactiveForm.svelte';
  import SearchSummary from '$components/dashboard/searchSummary.svelte';
  import PeriodChanger from '$components/searchFilter/periodChanger.svelte';
  import { Onboarding, Text } from '$components/onboarding';

  import { media } from 'svelte-match-media';
  import { setContext } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { copy } from '$utils/object';

  import { searchFilterUpdate } from '$stores/decr/searchFilter';
  import { getSearchFilterDates } from '$core/searchFilter/getSearchFilterDates';
  import { accentTags, generateLinkTags } from '$utils/accentTags';
  import { founderEmail } from '$services/config';

  export let ent: FullEntity<SearchFilter>;

  let searchFilter: FullEntity<SearchFilter> = copy(ent),
    prevEnt = copy(ent),
    group = ent.decr.group,
    edit: boolean = false;

  const reset = () => (searchFilter = copy(ent));
  /**
   * We mutate the object down the path. The only way to do it secure for the central store is to
   * pass it as a copy rather then a link to the object.
   */
  $: if (JSON.stringify(prevEnt) != JSON.stringify(ent)) {
    prevEnt = copy(ent);
    searchFilter = copy(ent);

    // Setting a matching group after switch
    group = ent.decr.group;
    page = 0;
    // Hiding the form when user leaves the page for other search
    edit = false;
  }

  // Updating the saved group using old store-based data
  $: if (ent.id == prevEnt.id && group != ent.decr.group)
    searchFilterUpdate({ ent, decr: { ...ent.decr, group } });

  let page = 0;
  $: dates = getSearchFilterDates({ group, page });

  // Resetting page number when search filter is changed or the period
  $: $resetPageKeyStore = `${searchFilter.id}${dates.startDate}${dates.endDate}`;
  setContext('resetPageKeyStore', resetPageKeyStore);

  $: textSlotWidth = $media.mobile ? 300 : 400;
</script>

<Onboarding noSlot shouldShow key="contactUs" {textSlotWidth} let:finishOnboarding>
  <svelte:fragment slot="text">
    <Text header>{$_('cmps.wallet.onboarding.contactUs.title')}</Text>
    <Text
      >{@html $_('cmps.wallet.onboarding.contactUs.text', {
        values: {
          ...accentTags,
          ...generateLinkTags(`mailto:${founderEmail}`),
          email: founderEmail,
        },
      })}</Text>
    <button class="button mt-3" on:click={finishOnboarding}
      >{$_('cmps.wallet.onboarding.contactUs.cta')}</button>
  </svelte:fragment>
</Onboarding>

<Page boxedView={false} counterName="dashboard">
  <div class="flex-full" slot="title-block">
    {#if $media.mobile}
      <SearchFilterReactiveForm bind:searchFilter bind:edit on:reset={reset} on:delete />
    {/if}
    <div class="mx-2" class:my-3={$media.mobile}>
      <SearchSummary {searchFilter} bind:edit />
    </div>
  </div>

  <div slot="no-margin">
    {#if !$media.mobile}
      <SearchFilterReactiveForm bind:searchFilter bind:edit on:reset={reset} on:delete />
    {/if}
    <div class="my-3 mx-2">
      <PeriodChanger bind:group bind:page {dates} />
      {#if dates}
        <DashboardAnalytics {searchFilter} {dates} />
      {/if}
    </div>
  </div>
</Page>
