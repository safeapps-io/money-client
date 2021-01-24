<script>
  import { _ } from 'svelte-i18n';

  import { Onboarding, Text } from '@/components/onboarding/index';

  import { FormError } from '@/services/errors';
  import { Form, MasterPasswordField } from '@/components/strict/index';

  import { currentChestsStore } from '@/stores/wallet';
  import { setNewMasterPassword } from '@/services/crypto/masterPassword';

  export let userId: string,
    isFirstPassword: boolean = true,
    cleanup: boolean = false,
    notificationText: undefined | string = undefined;

  const success = async ({ password }: { password: string }) => {
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
