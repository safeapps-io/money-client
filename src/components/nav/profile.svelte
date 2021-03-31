<script>
  import Dropdown from '$components/elements/dropdown/generic.svelte';
  import Link from '$components/elements/link.svelte';
  import Logout from '$components/user/logout.svelte';

  import { _ } from 'svelte-i18n';

  import { userSettingsPath, userSecurityPath } from '$core/routes';
  import { userEncrStore } from '$stores/user';

  $: user = $userEncrStore!;
  const addActiveClass = 'is-active';
</script>

<Dropdown right triggerText={user.username}>
  <Link href={userSettingsPath} class="dropdown-item" {addActiveClass}>
    {$_('cmps.nav.menu.settings')}
  </Link>
  <Link href={userSecurityPath} class="dropdown-item" {addActiveClass}>
    {$_('cmps.nav.menu.security')}
  </Link>
  <hr class="dropdown-divider" />
  <Logout class="dropdown-item has-text-danger" />
  <hr class="dropdown-divider" />
  <p class="dropdown-item is-size-7 has-text-grey">Version: {process.env.VERSION}</p>
</Dropdown>
