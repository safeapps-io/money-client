<script>
  import CopyText from '$components/elements/copyText.svelte';

  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { InviteService } from '$services/invite/inviteService';

  export let walletId: string, userId: string;

  const isPlanActive = getContext('isPlanActive')(true);

  let inviteLinks: string[] = [];
  const createNewInvite = async (e: Event) => {
    if (!isPlanActive(e)) return;
    try {
      const res = await InviteService.generateWalletInvite({ userId, walletId });
      inviteLinks = [...inviteLinks, res];
    } catch (error) {}
  };
</script>

{#if inviteLinks.length}
  <div in:slide>
    <div class="py-5">
      <p class="has-text-weight-bold">{$_('cmps.wallet.userAccess.invite.oneTime')}</p>
      <p>{$_('cmps.wallet.userAccess.invite.sendIt')}</p>
      <p>{$_('cmps.wallet.userAccess.invite.beOnline')}</p>

      <ul>
        {#each inviteLinks as inviteLink, index}
          <div in:slide={index == 0 ? { duration: 0 } : {}}>
            <CopyText text={inviteLink} />
          </div>
        {/each}
      </ul>
    </div>
  </div>
{/if}

<button class="button is-success is-outlined" on:click={createNewInvite}>
  {$_('cmps.wallet.userAccess.invite.create')}
</button>
