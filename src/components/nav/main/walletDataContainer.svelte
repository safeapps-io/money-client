<script>
  import OwnerFlow from '$components/wallet/joinWallet/ownerFlow.svelte';
  import ExpandableMenu from '$components/nav/expandableMenu.svelte';
  import Logo from '$components/nav/logo.svelte';
  import Menu from '$components/nav/menu.svelte';

  import { _ } from 'svelte-i18n';
  import { media } from 'svelte-match-media';
  import { fade } from 'svelte/transition';

  import { appPath } from '$core/routes';
  import { inviteToValidate } from '$services/invite/inviteStages';
  import { userEncrStore } from '$stores/user';

  $: user = $userEncrStore!;
</script>

{#if $inviteToValidate}
  <OwnerFlow inviteToValidate={$inviteToValidate} userId={user.id} />
{/if}

<main class="container fullheight" in:fade={{ duration: 1200 }}>
  <div class="fullheight {$media.mobile ? '' : 'columns pt-5'}">
    {#if $media.mobile}
      <ExpandableMenu>
        <slot />
      </ExpandableMenu>
    {:else}
      <div class="column is-3 aside">
        <a href={appPath}><Logo showAnimation /></a>
        <Menu />
      </div>
      <div class="column is-9">
        <slot />
      </div>
    {/if}
  </div>
</main>
