<script>
  import { Form, PasswordField } from '$components/strict';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  // import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { AuthService } from '$services/auth/authService';
  import { notification, NotificationStyles } from '$core/notification';
  import { noop } from 'svelte/internal';

  export let token: string;

  const dispatch = createEventDispatcher(),
    addNotification = noop as any,
    success = async (data: { password: string }) => {
      await AuthService.setPasswordFromToken({ ...data, token });
      addNotification(
        notification({
          text: $_('cmps.user.password.changed'),
        }),
      );
      dispatch('success');
    };

  let isValid = false;
  $: AuthService.isResetPasswordTokenValid(token)
    .then(() => (isValid = true))
    .catch(() => {
      isValid = false;
      addNotification(
        notification({
          text: $_('common.errors.linkExpired'),
          type: NotificationStyles.danger,
        }),
      );
      dispatch('invalid');
    });
</script>

<Form {success} buttonText={$_('common.form.change')} formDisabled={!isValid}>
  <PasswordField label={$_('cmps.user.password.new')} />
</Form>
