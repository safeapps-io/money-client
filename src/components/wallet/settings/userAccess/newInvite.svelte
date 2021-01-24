<script>
  import CopyText from '@/components/elements/copyText.svelte';

  import { onMount } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { AuthService } from '@/services/auth/authService';
  import { InviteService } from '@/services/invite/inviteService';

  export let walletId: string, userId: string, monthlyLimit: number | null;

  let inviteLinks: string[] = [],
    loading = true,
    currentUsage: number;

  onMount(() =>
    AuthService.currentMonthlyUsage().then(
      res => ((currentUsage = res.json.usage), (loading = false)),
    ),
  );

  $: realLimit = monthlyLimit ?? AuthService.defaultMonthlyLimit;
  $: disabled = currentUsage >= realLimit;

  const createNewInvite = async () => {
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

<button
  class="button is-success is-outlined"
  class:is-color-loading={loading}
  on:click={createNewInvite}
  {disabled}>
  {$_('cmps.wallet.userAccess.invite.create')}
</button>

{#if disabled}
  <p class="has-text-danger is-size-7" in:slide>{$_('cmps.wallet.userAccess.invite.limit')} 😥</p>
{/if}
