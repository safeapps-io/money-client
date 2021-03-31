<script>
  import { Form, Field, TextInput, PasswordField } from '$components/strict';
  import ResetPasswordRequest from './resetPasswordRequest.svelte';
  import Modal from '$components/elements/modal.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import { focusableShortcut } from '$utils/actions/shortcut';

  import { AuthService } from '$services/auth/authService';
  import { ensureString, trim, minLength } from '$core/strict/string';

  const dispatch = createEventDispatcher();

  $: usernameOrEmailConfig = {
    label: $_('cmps.user.username.usernameOrEmail'),
    name: 'usernameOrEmail',
    clean: [ensureString, trim],
    validate: [minLength(3)],
    required: true,
  };

  const success = async (data: { usernameOrEmail: string; password: string }) => {
    await AuthService.signIn(data);
    dispatch('success');
  };

  let active = false;
</script>

<Modal bind:active>
  <h2 class="subtitle mb-2">{$_('cmps.user.password.restore.title')}</h2>
  <ResetPasswordRequest on:success={() => (active = false)} />
</Modal>

<Form {success} buttonText={$_('cmps.user.signIn')}>
  <Field field={usernameOrEmailConfig}>
    <TextInput placeholder="whitfield.hellman" />
  </Field>
  <PasswordField label={$_('cmps.user.password.label')} />
  <div
    class="is-size-7 has-text-dotted has-text-link clickable mb-5"
    role="button"
    tabindex="0"
    on:click={() => (active = true)}
    use:focusableShortcut>
    {$_('cmps.user.password.forgot')}
  </div>
</Form>
