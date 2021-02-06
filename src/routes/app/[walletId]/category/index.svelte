<script>
  import Page from '@/components/nav/page.svelte';
  import Link from '@/components/elements/link.svelte';
  import Tabs from '@/components/elements/tabs.svelte';
  import CategoryList from '@/components/category/list.svelte';

  import { _ } from 'svelte-i18n';

  import { addCategoryPath } from '@/core/routes';
  import { categorySortedByTitleStore } from '@/stores/decr/category';

  const enum CategoryType {
    expense = '0',
    income = '1',
  }

  let selectedType = CategoryType.expense;
  $: sortedCategories = $categorySortedByTitleStore.filter(
    cat => cat.decr.isIncome === (selectedType === CategoryType.income),
  );
</script>

<Page boxedView={false}>
  <div class="is-flex" slot="title">
    <h1 class="title is-3 mr-3">{$_('cmps.category.common.categories')}</h1>
    <Link href={`${$addCategoryPath}?income=${selectedType}`} class="button is-success">
      {$_('common.form.create')}
    </Link>
  </div>

  <div class="is-flex flex-columns">
    <Tabs
      sticky
      classes="is-centered"
      tabs={[
        { value: CategoryType.expense, label: $_('cmps.transaction.common.expense') },
        { value: CategoryType.income, label: $_('cmps.transaction.common.income') },
      ]}
      bind:activeTab={selectedType} />

    <div class="flex-full">
      <CategoryList categories={sortedCategories} />
    </div>
  </div>
</Page>
