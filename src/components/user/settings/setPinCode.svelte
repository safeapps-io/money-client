<script>
  import { Form, PinCodeField } from '$components/strict';
  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';

  import { FormError } from '$services/errors';
  import { setPinCode } from '$services/crypto/masterPassword';
  import { keyWrappedWithPinStore } from '$stores/user';

  const success = async ({ pinCode }: { pinCode: string }) => {
    try {
      await setPinCode(pinCode);
    } catch (error) {
      throw new FormError({
        code: 0,
        message: $_('common.errors.generic'),
      });
    }
  };
</script>

<Onboarding preventSlotClick shouldShow key="pinCode" let:finishOnboarding>
  <Form
    {success}
    buttonText={$keyWrappedWithPinStore ? $_('common.form.change') : $_('common.form.set')}
    cleanup
    notificationText={$_('cmps.masterPassword.old.pin.setOkNotification')}>
    <PinCodeField />
  </Form>

  <svelte:fragment slot="text">
    <Text header>{$_('cmps.masterPassword.old.pin.onboarding.header')}</Text>
    <Text>{$_('cmps.masterPassword.old.pin.onboarding.main')}</Text>
    <Text>{$_('cmps.masterPassword.old.pin.onboarding.device')}</Text>

    <button class="button mt-3" on:click={finishOnboarding}>{$_('common.okDok')}</button>
  </svelte:fragment>
</Onboarding>
