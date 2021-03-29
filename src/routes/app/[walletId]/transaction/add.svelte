<script>
  import Page from '@/components/nav/page.svelte';
  import TransactionForm from '@/components/transaction/form/transaction.svelte';

  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';

  import { appPath } from '@/core/routes';
</script>

<Page title={$_('routes.wallet.addTr')} nestColumnClass="is-8">
  <TransactionForm on:success={() => goto(appPath)} />
</Page>
