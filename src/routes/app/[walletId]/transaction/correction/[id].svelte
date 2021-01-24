<script>
  import EditPage from '@/components/nav/editPage.svelte';
  import Page from '@/components/nav/page.svelte';
  import BalanceCorrectionForm from '@/components/transaction/form/balanceCorrection.svelte';

  import { _ } from 'svelte-i18n';
  import { stores, goto } from '@sapper/app';

  import { currentWalletCorrectionTransactionStore } from '@/stores/decr/correctionTransaction';
  import { appPath } from '@/core/routes';

  const { page } = stores(),
    redirectToDash = () => goto(appPath);

  $: ent = $currentWalletCorrectionTransactionStore[$page.params.id];
</script>

<Page title={$_('routes.wallet.changeCorr')} nestColumnClass="is-8">
  <EditPage hasEnt={!!ent}>
    <BalanceCorrectionForm {ent} on:delete={redirectToDash} on:success={redirectToDash} />
  </EditPage>
</Page>
