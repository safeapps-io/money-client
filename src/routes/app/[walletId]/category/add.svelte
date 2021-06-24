<script>
  import Page from '$components/nav/page.svelte';
  import CategoryForm from '$components/category/form.svelte';

  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { categoryListPath } from '$core/routes';
</script>

<Page title={$_('routes.category.create')} nestColumnClass="is-8">
  <CategoryForm
    on:success={() => goto($categoryListPath)}
    isIncomeCategory={$page.params.income === '1'} />
</Page>
