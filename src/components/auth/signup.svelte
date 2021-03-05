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
  import { slide } from 'svelte/transition';

  import { generateLinkTags } from '@/utils/accentTags';

  import { ensureBoolean } from '@/core/strict/boolean';
  import { termsPath } from '@/core/routes';
  import { AuthService } from '@/services/auth/authService';
  import { FormError } from '@/services/errors';

  export let invite: string | undefined = undefined;

  let shouldShowPassword2 = false;

  const dispatch = createEventDispatcher(),
    success = async ({
      username,
      email,
      password,
      password2,
    }: {
      email?: string;
      username: string;
      password: string;
      password2?: string;
    }) => {
      // We allow you to not add second password if you have set your email
      if (!email && !password2) return (shouldShowPassword2 = true);

      if (password2 && password !== password2)
        throw new FormError({
          code: 0,
          fieldErrors: { password2: [$_('cmps.masterPassword.old.pass.samePasswords')] },
        });

      const { isWalletInvite } = await AuthService.signUp({ username, email, password, invite });
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

  {#if shouldShowPassword2}
    <div class="field" in:slide>
      <PasswordField name="password2" label={$_('cmps.user.password.labelRepeat')} />
    </div>
  {/if}
</Form>

<p class="help mt-3">
  {@html $_('cmps.user.signup.agree', {
    values: generateLinkTags(termsPath),
  })}
</p>
