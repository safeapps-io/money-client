<script>
  import UserCard from './userCard.svelte';
  import NewInvite from './newInvite.svelte';

  import { getContext } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { AccessLevels, selectedWalletStore, walletStore } from '$stores/wallet';
  import { userEncrStore } from '$stores/user';

  const successNotif = getContext('success');

  $: wallet = $walletStore![$selectedWalletStore!];
  $: user = $userEncrStore!;
  $: isOwner = wallet.users.some(
    u => u.id == user.id && u.WalletAccess.accessLevel == AccessLevels.owner,
  );

  const onDelete = () => successNotif($_('cmps.deleteEntity.success'));
</script>

<ul class="my-4">
  {#each wallet.users as user, index (user.id)}
    <li>
      {#if index > 0}
        <hr />
      {/if}
      <UserCard
        {user}
        isCurrentUserOwner={isOwner}
        isOwnerCard={user.WalletAccess.accessLevel == AccessLevels.owner}
        walletId={wallet.id}
        on:delete={onDelete} />
    </li>
  {/each}
</ul>
{#if isOwner}
  <NewInvite walletId={wallet.id} userId={user.id} />
{/if}
