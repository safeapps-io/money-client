<script>
  import Page from '@/components/nav/page.svelte';
  import InviteSettings from '@/components/user/settings/invites.svelte';
  import LocaleSettings from '@/components/user/settings/locale.svelte';
  import EmailSettings from '@/components/user/settings/email.svelte';
  import UsernameSettings from '@/components/user/settings/username.svelte';
  import LogsSettings from '@/components/user/settings/getLogs.svelte';

  import { _ } from 'svelte-i18n';

  import { userEncrStore } from '@/stores/user';
  $: user = $userEncrStore!;
</script>

<Page title={$_('routes.user.generalTitle')} nestColumnClass="is-8">
  <h2 class="title has-text-centered">{$_('routes.user.invites')}</h2>
  <InviteSettings />
  <hr />
  <h2 class="subtitle">{$_('routes.user.username')}</h2>
  <UsernameSettings />
  <hr />
  <h2 class="subtitle">{$_('routes.user.email')}</h2>
  <EmailSettings {user} />
  <hr />
  <LocaleSettings />
  <hr />
  <LogsSettings />
</Page>
