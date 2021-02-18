<script>
  import { Onboarding, Text } from '@/components/onboarding';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { FormError } from '@/services/errors';
  import { Form, MasterPasswordField } from '@/components/strict';

  import { currentChestsStore } from '@/stores/wallet';
  import { setNewMasterPassword } from '@/services/crypto/masterPassword';

  export let userId: string,
    isFirstPassword: boolean = true,
    cleanup: boolean = false,
    notificationText: undefined | string = undefined;

  let shouldShowSecondPassword = false;

  const success = async ({ password, password2 }: { password: string; password2?: string }) => {
    if (isFirstPassword && !shouldShowSecondPassword) return (shouldShowSecondPassword = true);

    if (isFirstPassword && password !== password2)
      throw new FormError({
        code: 0,
        fieldErrors: { password2: [$_('cmps.masterPassword.old.pass.samePasswords')] },
      });

    try {
      await setNewMasterPassword({
        masterPassword: password,
        currentChests: $currentChestsStore,
        userId,
      });
    } catch (error) {
      throw new FormError({
        code: 0,
        message: $_('common.errors.generic'),
      });
    }
  };

  $: help = `${$_('cmps.masterPassword.setNew.help.common')} ${
    isFirstPassword ? '' : $_('cmps.masterPassword.setNew.help.invite')
  }`;
</script>

<Onboarding shouldShow={isFirstPassword}>
  <Form
    {success}
    {cleanup}
    {notificationText}
    buttonText={isFirstPassword ? $_('common.form.set') : $_('common.form.change')}>
    <MasterPasswordField {help} />
    {#if shouldShowSecondPassword}
      <div class="field" in:slide>
        <MasterPasswordField isSecond label={$_('cmps.user.password.labelRepeat')} />
      </div>
    {/if}
  </Form>

  <div slot="text">
    <Text header>{$_('cmps.masterPassword.setNew.onboarding.header')}</Text>
    <Text>
      {@html $_('cmps.masterPassword.setNew.onboarding.main', {
        values: { boldO: '<span class="has-text-weight-bold">', boldC: '</span>' },
      })}
    </Text>
  </div>
</Onboarding>
