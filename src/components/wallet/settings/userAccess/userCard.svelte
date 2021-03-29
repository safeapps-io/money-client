<script>
  import type { PublicUserData } from '$stores/wallet';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { WalletService } from '$services/wallet/walletService';

  const dispatch = createEventDispatcher();

  export let isCurrentUserOwner: boolean,
    user: PublicUserData,
    isOwnerCard: boolean,
    walletId: string;

  let loading = false;
  const deleteUser = async () => {
    loading = true;
    try {
      if (!window.confirm($_('cmps.wallet.userAccess.deleteConfirmation'))) return;

      await WalletService.deleteUser(walletId, user.id);
      dispatch('delete');
    } catch (error) {
    } finally {
      loading = false;
    }
  };
</script>

<div class="columns is-mobile is-vcentered">
  <div class="column flex-full">
    <p>
      {#if isOwnerCard}<span class="is-size-7">{$_('cmps.wallet.userAccess.owner')}</span>{/if}
      <span class="has-text-weight-semibold is-size-5">{user.username}</span>
    </p>
    <p class="is-size-7 has-text-grey">
      {$_('cmps.wallet.userAccess.dateJoined', { values: { date: new Date(user.created) } })}
    </p>
  </div>
  {#if isCurrentUserOwner && !isOwnerCard}
    <div class="column is-narrow">
      <button
        class="button is-danger is-light is-small"
        class:is-color-loading={loading}
        on:click={deleteUser}>
        {$_('cmps.deleteEntity.delete')}
      </button>
    </div>
  {/if}
</div>
