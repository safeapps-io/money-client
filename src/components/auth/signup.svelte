<script>
  import { Form, EmailField, PasswordField, UsernameField } from '@/components/strict';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { AuthService } from '@/services/auth/authService';

  export let invite: string | undefined = undefined;

  const dispatch = createEventDispatcher(),
    success = async (data: { email?: string; username: string; password: string; agree: true }) => {
      const { agree, ...authData } = data,
        { isWalletInvite } = await AuthService.signUp({ ...authData, invite });
      dispatch('success', isWalletInvite);
    };
</script>

<Form {success} buttonText={$_('cmps.user.signup.cta')}>
  <UsernameField />
  <EmailField help={$_('cmps.user.signup.whyEmail')} />
  <PasswordField label={$_('cmps.user.password.label')} />
</Form>

<p class="help mt-3">
  {@html $_('cmps.user.signup.agree', {
    values: {
      tagO: `<a href="https://safeapps.io/content/terms" target="_blank" rel="noopener">`,
      tagC: '</a>',
    },
  })}
</p>
