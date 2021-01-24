<script>
  import { createEventDispatcher } from 'svelte';

  import { Form, EmailField } from '@/components/strict/index';
  import { AuthService } from '@/services/auth/authService';

  const dispatch = createEventDispatcher(),
    success = async ({ email }: { email: string }) => {
      await AuthService.resetPasswordRequest(email);
      dispatch('success');
    };
</script>

<Form
  {success}
  buttonText="Получить ссылку"
  notificationText="Отправили письмо на почту. Следуйте инструкциям в нём">
  <EmailField
    required
    help="Если вы привязывали этот адрес к своему аккаунту, тогда на него придёт письмо с
    инструкциями по восстановлению доступа к аккаунту" />
</Form>
