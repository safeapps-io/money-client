<script>
  import Page from '@/components/nav/page.svelte';
  import WalletForm from '@/components/wallet/forms/wallet.svelte';
  import JointWalletForm from '@/components/wallet/forms/jointWallet.svelte';
  import Balance from '@/components/wallet/settings/balance.svelte';
  import ExportData from '@/components/wallet/settings/exportData.svelte';
  import DeleteWallet from '@/components/wallet/settings/deleteWallet.svelte';

  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';

  import { selectedJointWalletStore, selectedWalletStore } from '@/stores/wallet';
  import { userDecrStore } from '@/stores/decr/user';
  import { currentWalletDataStore } from '@/stores/decr/wallet';
  import { appPath } from '@/core/routes';

  $: selectedWalletId = $selectedWalletStore;
  $: walletEnt = $currentWalletDataStore;
  $: jointWalletEnt = $userDecrStore?.decr.jointWallets?.[$selectedJointWalletStore || ''];

  const deleteRedirect = () => goto(appPath);
</script>

<Page title={$_('routes.wallet.settings')} nestColumnClass="is-8">
  {#if selectedWalletId}
    <h2 class="subtitle">{$_('routes.wallet.common')}</h2>
    <WalletForm ent={walletEnt} notificationText={$_('common.form.okNotif')} />
    <hr />
    <h2 class="subtitle">{$_('routes.wallet.balance')}</h2>
    <Balance wallet={walletEnt} />
    <hr />
    <h2 class="subtitle">{$_('routes.wallet.export')}</h2>
    <ExportData />
    <hr />
    <h2 class="subtitle">{$_('routes.wallet.delete')}</h2>
    <DeleteWallet
      walletName={walletEnt.decr.name}
      walletId={selectedWalletId}
      on:success={deleteRedirect} />
  {:else if $selectedJointWalletStore}
    <h2 class="subtitle">{$_('routes.wallet.common')}</h2>
    <JointWalletForm ent={jointWalletEnt} notificationText={$_('common.form.okNotif')} />
  {/if}
</Page>
