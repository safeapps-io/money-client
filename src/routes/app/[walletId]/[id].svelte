<script>
  import EditPage from '@/components/nav/editPage.svelte';
  import DashboardIndex from '@/components/dashboard/index.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { currentWalletSearchFilterStore } from '@/stores/decr/searchFilter';
  import { appPath } from '@/core/routes';

  const redirectToRoot = () => goto(appPath);

  $: ent = $currentWalletSearchFilterStore[$page.params.id];
</script>

<EditPage hasEnt={!!ent}>
  <DashboardIndex {ent} on:delete={redirectToRoot} />
</EditPage>
