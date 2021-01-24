<script>
  import Page from '@/components/nav/page.svelte';
  import UserAccessList from '@/components/wallet/settings/userAccess/users.svelte';
  import WalletUserList from '@/components/wallet/settings/walletUser/list.svelte';

  import { _ } from 'svelte-i18n';
</script>

<Page title={$_('routes.wallet.settings')} nestColumnClass="is-8">
  <div class="mb-6">
    <h2 class="subtitle">{$_('routes.wallet.walletAccess.title')}</h2>
    <p class="help">{$_('routes.wallet.walletAccess.help')}</p>
    <UserAccessList />
  </div>
  <h2 class="subtitle">{$_('routes.wallet.walletUsers.title')}</h2>
  <p class="help">{$_('routes.wallet.walletUsers.help')}</p>
  <div class="mt-4">
    <WalletUserList />
  </div>
</Page>
