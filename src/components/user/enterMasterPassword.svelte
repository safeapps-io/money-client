<script>
  import { FormError } from '$services/errors';
  import { Form, MasterPasswordField, PinCodeField } from '$components/strict';

  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { focusableShortcut } from '$utils/actions/shortcut';

  import { enterMasterPassword, enterPinCode } from '$services/crypto/masterPassword';
  import { keyWrappedWithPinStore } from '$stores/user';

  export let b64salt: string, b64InvitePublicKey: string, b64EncryptedInvitePrivateKey: string;

  let enteringPin = false;
  onMount(() => (enteringPin = !!$keyWrappedWithPinStore));

  const pinSuccess = async ({ pinCode }: { pinCode: string }) => {
      try {
        await enterPinCode({
          pinCode,
          wrappedKey: $keyWrappedWithPinStore!,
          b64salt,
          b64InvitePublicKey,
          b64EncryptedInvitePrivateKey,
        });
      } catch (error) {
        throw new FormError({
          code: 0,
          fieldErrors: { pinCode: [$_('cmps.masterPassword.old.pin.invalid')] },
        });
      }
    },
    masterPasswordSuccess = async ({ password }: { password: string }) => {
      try {
        await enterMasterPassword({
          input: password,
          b64salt,
          b64InvitePublicKey,
          b64EncryptedInvitePrivateKey,
        });
      } catch (error) {
        throw new FormError({
          code: 0,
          fieldErrors: { password: [$_('cmps.masterPassword.old.pass.invalid')] },
        });
      }
    };
</script>

{#if $keyWrappedWithPinStore}
  <div
    role="button"
    tabindex="0"
    class="is-size-7 has-text-dotted has-text-link clickable"
    on:click={() => (enteringPin = !enteringPin)}
    use:focusableShortcut>
    {#if enteringPin}
      {$_('cmps.masterPassword.old.pass.enter')}
    {:else}{$_('cmps.masterPassword.old.pin.enter')}{/if}
  </div>
{/if}

{#if enteringPin}
  <Form success={pinSuccess} buttonText={$_('cmps.masterPassword.old.openSafe')}>
    <PinCodeField autofocus showHelp={false} />
  </Form>
{:else}
  <Form success={masterPasswordSuccess} buttonText={$_('cmps.masterPassword.old.openSafe')}>
    <MasterPasswordField label={$_('cmps.masterPassword.old.pass.label')} validate={false} />
  </Form>
{/if}
