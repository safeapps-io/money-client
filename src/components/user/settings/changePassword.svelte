<script>
  import { Form, PasswordField } from '@/components/strict/index';

  import { _ } from 'svelte-i18n';
  import { AuthService } from '@/services/auth/authService';

  const success = async (data: { newPassword: string; oldPassword: string }) =>
    AuthService.changePassword(data);
</script>

<Form
  {success}
  buttonText={$_('common.form.change')}
  cleanup
  notificationText={$_('cmps.user.password.changed')}>
  <PasswordField name="oldPassword" label={$_('cmps.user.password.old')} />
  <PasswordField name="newPassword" label={$_('cmps.user.password.new')} />
</Form>
