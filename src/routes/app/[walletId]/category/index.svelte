<script>
  import Page from '$components/nav/page.svelte';
  import Tabs from '$components/elements/tabs.svelte';
  import CategoryList from '$components/category/list.svelte';

  import { _ } from 'svelte-i18n';

  import { addCategoryPath } from '$core/routes';
  import { categorySortedByTitleStore } from '$stores/decr/category';
  import { runCheck } from '$components/billing/planOfferModal.svelte';

  let isIncome = false;
  $: sortedCategories = $categorySortedByTitleStore.filter(cat => cat.decr.isIncome === isIncome);
</script>

<Page boxedView={false}>
  <div class="is-flex" slot="title">
    <h1 class="title is-3 mr-3">{$_('cmps.category.common.categories')}</h1>
    <a href="{$addCategoryPath}?income={isIncome}" class="button is-success" on:click={runCheck}>
      {$_('common.form.create')}
    </a>
  </div>

  <div class="is-flex flex-columns">
    <Tabs
      sticky
      classes="is-centered"
      tabs={[
        { value: false, label: $_('cmps.transaction.common.expense') },
        { value: true, label: $_('cmps.transaction.common.income') },
      ]}
      bind:activeTab={isIncome} />

    <div class="flex-full">
      <CategoryList categories={sortedCategories} />
    </div>
  </div>
</Page>
