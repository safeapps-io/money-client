<script>
  import Page from '@/components/nav/page.svelte';
  import EditPage from '@/components/nav/editPage.svelte';
  import TransactionForm from '@/components/transaction/form/transaction.svelte';

  import { _ } from 'svelte-i18n';
  import { stores, goto } from '@sapper/app';

  import { currentWalletTransactionStore } from '@/stores/decr/transaction';
  import { appPath } from '@/core/routes';

  const { page } = stores(),
    redirectToDash = () => goto(appPath);

  $: ent = $currentWalletTransactionStore[$page.params.id];
</script>

<Page title={$_('routes.wallet.changeTr')} nestColumnClass="is-8">
  <EditPage hasEnt={!!ent}>
    <TransactionForm {ent} on:success={redirectToDash} on:delete={redirectToDash} />
  </EditPage>
</Page>
