<script>
  import { stores, goto } from '@sapper/app';

  import EditPage from '@/components/nav/editPage.svelte';
  import DashboardIndex from '@/components/dashboard/index.svelte';

  import { currentWalletSearchFilterStore } from '@/stores/decr/searchFilter';
  import { appPath } from '@/core/routes';

  const { page } = stores(),
    redirectToRoot = () => goto(appPath);

  $: ent = $currentWalletSearchFilterStore[$page.params.id];
</script>

<EditPage hasEnt={!!ent}>
  <DashboardIndex {ent} on:delete={redirectToRoot} />
</EditPage>
