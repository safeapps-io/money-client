<script>
  import { createEventDispatcher } from 'svelte';

  import {
    Form,
    Field,
    CheckboxInput,
    EmailField,
    PasswordField,
    UsernameField,
  } from '@/components/strict/index';

  import { ensureBoolean, needValue } from '@/core/strict/boolean';
  import { AuthService } from '@/services/auth/authService';

  export let invite: string | undefined = undefined;

  const dispatch = createEventDispatcher(),
    agreeField = {
      name: 'agree',
      label: 'Я принимаю условия и правила сервиса',
      clean: [ensureBoolean],
      validate: [needValue(true)],
    },
    success = async (data: { email?: string; username: string; password: string; agree: true }) => {
      const { agree, ...authData } = data,
        { isWalletInvite } = await AuthService.signUp({ ...authData, invite: invite! });
      dispatch('success', isWalletInvite);
    };
</script>

<Form {success} buttonText="Зарегистрироваться" formDisabled={!invite}>
  <UsernameField />
  <EmailField
    help="Почта нужна, чтоб вы могли восстановить доступ к аккаунту, но это необязательно. В
    будущем мы отдельно спросим, хотите ли вы получать наши письма" />
  <PasswordField label="Пароль" />
  <Field field={agreeField}>
    <CheckboxInput />
  </Field>
</Form>
