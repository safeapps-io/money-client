<script>
  import Page from '@/components/nav/page.svelte';
  import CategoryForm from '@/components/category/form.svelte';

  import { _ } from 'svelte-i18n';
  import { goto, stores } from '@sapper/app';

  import { categoryListPath } from '@/core/routes';

  const { page } = stores();
</script>

<Page title={$_('routes.category.create')} nestColumnClass="is-8">
  <CategoryForm
    on:success={() => goto($categoryListPath)}
    isIncomeCategory={$page.query.income === '1'} />
</Page>
