<script>
  import Page from '@/components/nav/page.svelte';
  import SetNewMasterPassword from '@/components/user/setNewMasterPassword.svelte';
  import ChangePassword from '@/components/user/settings/changePassword.svelte';
  import SetPinCode from '@/components/user/settings/setPinCode.svelte';
  import Sessions from '@/components/user/settings/sessions.svelte';
  import DropUser from '@/components/user/settings/dropUser.svelte';

  import { _ } from 'svelte-i18n';

  import { userEncrStore } from '@/stores/user';

  $: userId = $userEncrStore!.id;
</script>

<Page title={$_('cmps.nav.menu.security')} nestColumnClass="is-8">
  <h2 class="subtitle">{$_('routes.user.masterPass')}</h2>
  <SetNewMasterPassword
    {userId}
    isFirstPassword={false}
    cleanup
    notificationText={$_('routes.user.masterPassOk')} />
  <hr />
  <h2 class="subtitle">{$_('routes.user.pin')}</h2>
  <SetPinCode />
  <hr />
  <h2 class="subtitle">{$_('routes.user.pass')}</h2>
  <ChangePassword />
  <hr />
  <h2 class="subtitle">{$_('routes.user.sessions')}</h2>
  <Sessions />
  <hr />
  <h2 class="subtitle">{$_('routes.user.dropUser')}</h2>
  <DropUser />
  <p class="help">{$_('routes.user.dropUserHelp')}</p>
</Page>
