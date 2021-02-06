<script>
  import { Field, SelectInput } from '@/components/strict';

  import { _ } from 'svelte-i18n';

  import {
    getSelectedJointWalletIds,
    getJointWalletFieldChoices,
  } from '@/core/wallet/getJointWalletFieldChoices';
  import { walletDataStore } from '@/stores/decr/wallet';
  import { selectedJointWalletStore, jointWalletsStore } from '@/stores/wallet';

  export let walletId: string | undefined = undefined;

  const jointWalletIds = getSelectedJointWalletIds($selectedJointWalletStore, $jointWalletsStore),
    field = {
      name: 'walletId',
      inputValue: walletId,
      disabled: !!walletId,
      choices: getJointWalletFieldChoices($walletDataStore!, jointWalletIds),
      label: $_('cmps.wallet.common.wallet'),
    };
</script>

{#if $selectedJointWalletStore}
  <Field {field}>
    <SelectInput />
  </Field>
{/if}
