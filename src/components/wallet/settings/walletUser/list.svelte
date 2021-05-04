<script>
  import type { FullEntity, WalletUser } from '$stores/decr/types';

  import Modal from '$components/elements/modal.svelte';
  import WalletUserForm from '$components/wallet/settings/walletUser/form.svelte';

  import { _ } from 'svelte-i18n';
  import cssVars from 'svelte-css-vars';

  import { walletUserSortedByCreatedStore } from '$stores/decr/walletUser';
  import { runCurrentWalletPlanCheck } from '$components/billing/planOfferModal.svelte';

  let active = false,
    ent: FullEntity<WalletUser> | undefined = undefined;

  const handleClick = (newEnt: typeof ent) => (e: Event) => {
    const res = runCurrentWalletPlanCheck(e);
    if (res) {
      ent = newEnt;
      active = true;
    }
  };
</script>

<Modal bind:active>
  <WalletUserForm {ent} on:close={() => (active = false)} />
</Modal>

<ul class="mb-4">
  {#each $walletUserSortedByCreatedStore as walletUser (walletUser.id)}
    <li
      class="is-flex space-between my-3 py-3 px-2"
      use:cssVars={{ userColor: walletUser.decr.color }}>
      <div>{walletUser.decr.name}</div>
      <button class="button is-small is-light" on:click={handleClick(walletUser)}>
        {$_('common.form.change')}
      </button>
    </li>
  {/each}
</ul>

<button class="button is-success is-outlined" on:click={handleClick(undefined)}>
  {$_('cmps.wallet.user.createNew')}
</button>

<style lang="scss">
  li {
    border: none;
    border-left: 3px solid var(--userColor);

    align-items: center;
  }
</style>
