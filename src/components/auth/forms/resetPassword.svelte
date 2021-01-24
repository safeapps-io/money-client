<script>
  import { createEventDispatcher } from 'svelte';
  import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { AuthService } from '@/services/auth/authService';
  import { notification, NotificationStyles } from '@/core/notification';

  import { Form, PasswordField } from '@/components/strict/index';

  export let token: string;

  const dispatch = createEventDispatcher(),
    { addNotification } = getNotificationsContext(),
    success = async (data: { password: string }) => {
      await AuthService.setPasswordFromToken({ ...data, token });
      addNotification(
        notification({
          text: 'Пароль успешно установлен',
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
          text: 'Ссылка неверная или уже истекла',
          type: NotificationStyles.danger,
        }),
      );
      dispatch('invalid');
    });
</script>

<Form {success} buttonText="Установить пароль" formDisabled={!isValid}>
  <PasswordField label="Новый пароль" />
</Form>
