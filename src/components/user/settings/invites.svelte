<script>
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import CopyText from '@/components/elements/copyText.svelte';

  import { AuthService } from '@/services/auth/authService';
  import { InviteService } from '@/services/invite/inviteService';

  export let userId: string, monthlyLimit: number | null;
  let prevUserId: string = '',
    inviteLink: string,
    usage: number,
    loading = false;

  const load = async () => {
    loading = true;
    try {
      const [_inviteLink, usageRes] = await Promise.all([
        InviteService.generateServiceInvite(userId),
        AuthService.currentMonthlyUsage(),
      ]);
      inviteLink = _inviteLink;
      usage = usageRes.json.usage;
    } catch (error) {
    } finally {
      loading = false;
    }
  };

  $: if (userId != prevUserId) {
    prevUserId = userId;
    load();
  }

  $: realLimit = monthlyLimit ?? AuthService.defaultMonthlyLimit;

  const enum ViewModes {
    noInvitedYet,
    hasInvited,
    disableInvites,
  }
  let mode: ViewModes;
  $: {
    // Real limit could be set to 0 from backend
    if (realLimit != 0 && usage == 0) mode = ViewModes.noInvitedYet;
    else if (usage < realLimit) mode = ViewModes.hasInvited;
    else if (usage >= realLimit) mode = ViewModes.disableInvites;
  }
</script>

{#if loading}
  <p transition:slide|local>{$_('cmps.nav.loading')}</p>
{:else}
  <div transition:slide|local>
    <p class="is-size-2 has-text-centered">
      <span
        class="px-5 py-3"
        class:has-background-danger-light={mode == ViewModes.disableInvites}
        class:has-background-success-light={mode != ViewModes.disableInvites}>
        {usage}/{realLimit}
      </span>
    </p>
    <p class="has-text-centered">
      {#if mode == ViewModes.noInvitedYet}
        {$_('cmps.user.invites.noInvitedYet')}
      {:else if mode == ViewModes.hasInvited}
        {$_('cmps.user.invites.hasInvited')}
      {:else if mode == ViewModes.disableInvites}{$_('cmps.wallet.userAccess.invite.limit')}{/if}
    </p>
    {#if mode != ViewModes.disableInvites}
      <p class="mt-5">{$_('cmps.user.invites.send')}</p>
      <CopyText text={inviteLink} />
    {/if}
  </div>
{/if}
