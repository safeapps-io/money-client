<script>
  import Page from '@/components/nav/page.svelte';
  import EditPage from '@/components/nav/editPage.svelte';
  import CategoryForm from '@/components/category/form.svelte';

  import { _ } from 'svelte-i18n';
  import { stores, goto } from '@sapper/app';

  import { categoryListPath } from '@/core/routes';
  import { currentWalletCategoryStore } from '@/stores/decr/category';

  const { page } = stores(),
    redirectToList = () => goto($categoryListPath);

  $: ent = $currentWalletCategoryStore[$page.params.id];
</script>

<Page title={$_('routes.category.change')} nestColumnClass="is-8">
  <EditPage hasEnt={!!ent}>
    <CategoryForm {ent} on:success={redirectToList} on:delete={redirectToList} />
  </EditPage>
</Page>
