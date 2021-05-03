<script>
  import Dropdown from '$components/elements/dropdown/generic.svelte';
  import WalletCreateModal from '$components/wallet/modalCreate.svelte';

  import type { FullEntity, WalletData } from '$stores/decr/types';

  import { _ } from 'svelte-i18n';
  import layersSubtractIcon from 'teenyicons/outline/layers-subtract.svg';

  import { focusableShortcut } from '$utils/actions/shortcut';

  import { rootJointWalletPath, rootWalletPath } from '$core/routes';

  import { runCurrentUserPlanCheck } from '$components/billing/planOfferModal.svelte';
  import { selectedWalletStore, selectedJointWalletStore, walletStore } from '$stores/wallet';
  import { walletDataStore } from '$stores/decr/wallet';
  import { jointWalletsStore } from '$stores/wallet';

  let active = false,
    triggerText: string | undefined;

  $: if ($selectedWalletStore)
    triggerText = Object.values($walletDataStore).find(wd => wd.walletId == $selectedWalletStore)
      ?.decr.name;
  else if ($selectedJointWalletStore)
    triggerText = $jointWalletsStore![$selectedJointWalletStore!].name;

  // It's a workaround for the case when you delete a wallet
  let availableWalletData: FullEntity<WalletData>[] = [];
  $: {
    const availableWalletIds = Object.keys($walletStore!);
    availableWalletData = Object.values($walletDataStore).filter(({ walletId }) =>
      availableWalletIds.includes(walletId),
    );
  }
</script>

<WalletCreateModal bind:active />
<div class="my-5">
  <Dropdown {triggerText} fullwidth let:hide>
    {#each Object.values($jointWalletsStore || []) as { id, name } (id)}
      <a
        class="dropdown-item"
        class:is-active={$selectedJointWalletStore == id}
        href={$rootJointWalletPath(id)}
        on:click={hide}>
        <div class="is-flex">
          <span class="icon is-small mr-3">
            <img src={layersSubtractIcon} alt="joint" height="15" width="15" />
          </span>

          <span>{name}</span>
        </div>
      </a>
    {/each}
    {#each availableWalletData as { walletId, decr } (walletId)}
      <a
        class="dropdown-item"
        class:is-active={$selectedWalletStore == walletId}
        href={$rootWalletPath(walletId)}
        on:click={hide}>
        {decr.name}
      </a>
    {/each}
    <hr class="dropdown-divider" />
    <div
      role="button"
      tabindex="0"
      class="dropdown-item has-text-success clickable"
      on:click={() => {
        hide();
        active = runCurrentUserPlanCheck();
      }}
      use:focusableShortcut>
      {$_('cmps.wallet.create.wallet')}
    </div>
  </Dropdown>
</div>
