<script>
  import { Choices } from '$components/strict';

  import { _ } from 'svelte-i18n';

  import {
    getSelectedJointWalletIds,
    getJointWalletFieldChoices,
  } from '$core/wallet/getJointWalletFieldChoices';
  import { walletDataStore } from '$stores/decr/wallet';
  import { selectedJointWalletStore, jointWalletsStore } from '$stores/wallet';

  $: jointWalletIds = getSelectedJointWalletIds($selectedJointWalletStore, $jointWalletsStore);

  $: choices = getJointWalletFieldChoices($walletDataStore!, jointWalletIds);

  const id = Math.random().toString();
  export let walletId: string;

  $: if (!walletId) walletId = choices[0]?.value;
</script>

{#if $selectedJointWalletStore}
  <div class="field">
    <label for={id} class="label">{$_('cmps.wallet.common.wallet')}</label>
    <div class="select">
      <select {id} bind:value={walletId}>
        <Choices {choices} />
      </select>
    </div>
  </div>
{/if}
