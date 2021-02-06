<script>
  import {
    Form,
    Field,
    EmailField,
    PasswordField,
    UsernameField,
    CheckboxInput,
  } from '@/components/strict';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { ensureBoolean } from '@/core/strict/boolean';
  import { termsPath } from '@/core/routes';
  import { AuthService } from '@/services/auth/authService';

  export let invite: string | undefined = undefined;

  const dispatch = createEventDispatcher(),
    success = async (data: { email?: string; username: string; password: string }) => {
      const { isWalletInvite } = await AuthService.signUp({ ...data, invite });
      dispatch('success', isWalletInvite);
    };
</script>

<Form {success} buttonText={$_('cmps.user.signup.cta')}>
  <UsernameField />
  <EmailField help={$_('cmps.user.signup.whyEmail')} />
  <Field
    field={{
      name: 'isSubscribed',
      hideLabel: true,
      label: $_('cmps.user.signup.subscribe'),
      clean: [ensureBoolean],
    }}>
    <CheckboxInput />
  </Field>
  <PasswordField label={$_('cmps.user.password.label')} />
</Form>

<p class="help mt-3">
  {@html $_('cmps.user.signup.agree', {
    values: {
      tagO: `<a href="${termsPath}" target="_blank" rel="noopener">`,
      tagC: '</a>',
    },
  })}
</p>
