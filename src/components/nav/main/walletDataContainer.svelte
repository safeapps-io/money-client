<script>
  import OwnerFlow from '$components/wallet/joinWallet/ownerFlow.svelte';
  import ExpandableMenu from '$components/nav/expandableMenu.svelte';
  import Logo from '$components/nav/logo.svelte';
  import Menu from '$components/nav/menu.svelte';

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

<main class="container fullheight">
  {#if $media.mobile}
    <div class="fullheight" in:fade={{ duration: 1200 }}>
      <ExpandableMenu>
        <slot />
      </ExpandableMenu>
    </div>
  {:else}
    <div class="columns pt-5 fullheight" in:fade={{ duration: 1200 }}>
      <div class="column is-3 aside">
        <a href={appPath}><Logo showAnimation /></a>
        <Menu />
      </div>
      <div class="column is-9">
        <slot />
      </div>
    </div>
  {/if}
</main>
