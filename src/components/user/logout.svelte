<script>
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { AuthService } from '@/services/auth/authService';

  import { focusableShortcut } from '@/utils/actions/shortcut';

  import { loginPath } from '@/core/routes';

  export let display = 'block';

  const logout = async () => {
    await AuthService.logout();
    goto(loginPath);
  };
</script>

<!-- svelte-ignore a11y-missing-attribute -->
<a
  class={$$restProps.class + ' clickable'}
  role="button"
  tabindex="0"
  style={`display: ${display}`}
  on:click={logout}
  use:focusableShortcut>
  {$_('cmps.user.logout')}
</a>
