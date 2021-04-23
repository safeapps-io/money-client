<script>
  import type { UserEncrState } from '$stores/user';

  import { Form, EmailField } from '$strict';

  import { _ } from 'svelte-i18n';
  import { AuthService } from '$services/auth/authService';

  export let user: UserEncrState;

  $: help = user.email
    ? $_('cmps.user.email.setNew', { values: { email: user.email } })
    : $_('cmps.user.email.notSet');

  const success = ({ email }: { email: string }) => AuthService.updateUser({ email });
</script>

<Form
  buttonText={$_('common.form.change')}
  {success}
  cleanup
  notificationText={$_('cmps.user.email.toVerifyNotif')}>
  <EmailField required {help} />
</Form>
