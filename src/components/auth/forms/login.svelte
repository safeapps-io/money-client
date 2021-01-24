<script>
  import { createEventDispatcher } from 'svelte';

  import { focusableShortcut } from '@/utils/actions/shortcut';

  import { Form, Field, TextInput, PasswordField } from '@/components/strict/index';
  import Modal from '@/components/elements/modal.svelte';

  import { AuthService } from '@/services/auth/authService';
  import { ensureString, trim, minLength } from '@/core/strict/string';
  import ResetPasswordRequest from './resetPasswordRequest.svelte';

  const dispatch = createEventDispatcher();

  const usernameOrEmailConfig = {
      label: 'Юзернейм или почта',
      name: 'usernameOrEmail',
      clean: [ensureString, trim],
      validate: [minLength(3)],
      required: true,
    },
    success = async (data: { usernameOrEmail: string; password: string }) => {
      await AuthService.signIn(data);
      dispatch('success');
    };

  let active = false;
</script>

<Modal bind:active>
  <h2 class="subtitle mb-2">Восстановить пароль</h2>
  <ResetPasswordRequest on:success={() => (active = false)} />
</Modal>

<Form {success} buttonText="Войти">
  <Field field={usernameOrEmailConfig}>
    <TextInput placeholder="whitfield.hellman" />
  </Field>
  <PasswordField label="Пароль" />
  <div
    class="is-size-7 has-text-dotted has-text-link clickable mb-5"
    role="button"
    tabindex="0"
    on:click={() => (active = true)}
    use:focusableShortcut
  >Забыли пароль?</div>
</Form>
