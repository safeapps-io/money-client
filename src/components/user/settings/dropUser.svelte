<script>
  import { Form, PasswordField, UsernameField } from '@/components/strict';
  import Modal from '@/components/elements/modal.svelte';

  import { _ } from 'svelte-i18n';

  import { accentTags, generateLinkTags } from '@/utils/accentTags';

  import { AuthService } from '@/services/auth/authService';
  import { walletGeneralSettingsPath } from '@/core/routes';
  import { userEncrStore } from '@/stores/user';
  import { FormError } from '@/services/errors';

  let active = false,
    noExitAnimation = false;

  const success = async ({ username, password }: { username: string; password: string }) => {
    if (username !== $userEncrStore!.username)
      throw new FormError({ code: 0, fieldErrors: { username: [$_('common.incorrectData')] } });

    noExitAnimation = true;
    await AuthService.dropUser(password);
  };
</script>

<Modal {noExitAnimation} bind:active>
  <h2 class="subtitle">{$_('common.dangerZone').toUpperCase()}</h2>
  <p class="mb-4">
    {$_('cmps.user.drop.aboutTo')}
  </p>
  <p class="mb-4">
    {@html $_('cmps.user.drop.irreversible', {
      values: generateLinkTags($walletGeneralSettingsPath, false),
    })}
  </p>
  <p class="mb-4">
    {@html $_('cmps.user.drop.validation', { values: accentTags })}
  </p>

  <Form
    {success}
    buttonText={$_('cmps.user.drop.cta')}
    notificationText={$_('cmps.user.drop.notification')}>
    <UsernameField />
    <PasswordField name="password" label={$_('cmps.user.password.label')} />
  </Form>
</Modal>

<button class="button is-danger is-outlined" on:click={() => (active = true)}
  >{$_('cmps.user.drop.cta')}</button>
