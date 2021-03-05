<script>
  import Modal from '@/components/elements/modal.svelte';
  import { Form, Field, TextInput } from '@/components/strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { WalletService } from '@/services/wallet/walletService';

  const dispatch = createEventDispatcher();

  export let walletId: string, walletName: string;

  const validateFn = (val: string) => {
      if (val != walletName) return $_('cmps.wallet.delete.nameCheck');
    },
    field = {
      name: '',
      validate: [validateFn],
    };

  let active = false,
    noExitAnimation = false;

  const success = async () => {
    noExitAnimation = true;
    await WalletService.delete(walletId);
    dispatch('success');
  };
</script>

<Modal {noExitAnimation} bind:active>
  <h2 class="subtitle">{$_('common.dangerZone').toUpperCase()}</h2>
  <p class="mb-4">
    {@html $_('cmps.wallet.delete.walletName', {
      values: { walletName, tagO: '<code>', tagC: '</code>' },
    })}
  </p>
  <p class="mb-4">
    {@html $_('cmps.wallet.delete.cannotRestore', {
      values: { tagO: '<span class="is-uppercase has-text-weight-bold">', tagC: '</span>' },
    })}
  </p>
  <p>{$_('cmps.deleteEntity.confirmation')}</p>

  <Form {success}>
    <Field {field}>
      <TextInput />
    </Field>

    <div class="field" slot="submit" let:loading let:disabled>
      <button class="button is-danger is-outlined" class:is-color-loading={loading} {disabled}
        >{$_('cmps.deleteEntity.delete')}</button>
    </div>
  </Form>
</Modal>

<button class="button is-danger is-outlined" on:click={() => (active = true)}
  >{$_('cmps.deleteEntity.delete')}</button>
