<script>
  import { Form, EmailField } from '$components/strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { AuthService } from '$services/auth/authService';

  const dispatch = createEventDispatcher(),
    success = async ({ email }: { email: string }) => {
      await AuthService.resetPasswordRequest(email);
      dispatch('success');
    };
</script>

<Form
  {success}
  buttonText={$_('cmps.user.password.restore.cta')}
  notificationText={$_('cmps.user.password.restore.notification')}>
  <EmailField required help={$_('cmps.user.password.restore.emailHelp')} />
</Form>
