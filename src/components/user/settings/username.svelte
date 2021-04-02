<script>
  import { Form, UsernameField } from '$components/strict';

  import { _ } from 'svelte-i18n';
  import { AuthService } from '$services/auth/authService';

  const success = ({ username }: { username: string }) => AuthService.updateUser({ username });
</script>

<Form
  buttonText={$_('common.form.change')}
  {success}
  cleanup
  notificationText={$_('cmps.user.username.changedNotif')}>
  <UsernameField />
</Form>
