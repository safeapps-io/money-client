<script>
  import type { FullEntity, WalletUser } from '$stores/decr/types';

  import { Form, NameField, ColorField } from '$strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { focusableShortcut } from '$utils/actions/shortcut';

  import { selectedWalletStore } from '$stores/wallet';
  import { walletUserAdd, walletUserUpdate } from '$stores/decr/walletUser';

  export let ent: FullEntity<WalletUser> | undefined = undefined;

  const dispatch = createEventDispatcher(),
    success = async (data: { name: string; color: string }) => {
      await (ent
        ? walletUserUpdate({ ent, decr: { ...ent.decr, ...data } })
        : walletUserAdd($selectedWalletStore!, data));
      dispatch('close');
    };
</script>

<Form planLimit {success}>
  <NameField inputValue={ent ? ent.decr.name : undefined} />
  <ColorField inputValue={ent ? ent.decr.color : undefined} />

  <div class="is-flex space-between" slot="submit">
    <button class="button is-success is-outlined"
      >{ent ? $_('common.form.change') : $_('common.form.create')}</button>
    <button
      class="button"
      role="button"
      tabindex="0"
      on:click={() => dispatch('close')}
      use:focusableShortcut>{$_('common.form.cancel')}</button>
  </div>
</Form>
