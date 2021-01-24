<script>
  import TransactionListWithLinks from '@/components/transaction/listWithLinks.svelte';
  import Page from '@/components/nav/page.svelte';

  import { _ } from 'svelte-i18n';

  import { draftTransactionStore } from '@/stores/decr/transaction';
</script>

<Page title={$_('cmps.nav.menu.drafts')} nestColumnClass="is-8">
  <TransactionListWithLinks transactions={$draftTransactionStore} />
</Page>
