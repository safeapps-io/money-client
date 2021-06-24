<script>
  import OwnerFlow from '$components/wallet/joinWallet/ownerFlow.svelte';
  import ExpandableMenu from '$components/nav/expandableMenu.svelte';
  import Logo from '$components/nav/logo.svelte';
  import Menu from '$components/nav/menu.svelte';
  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';
  import { media } from 'svelte-match-media';
  import { fade } from 'svelte/transition';

  import { accentTags, generateLinkTags } from '$utils/accentTags';

  import { appPath } from '$core/routes';
  import { inviteToValidate } from '$services/invite/inviteStages';
  import { founderEmail } from '$services/config';
  import { userEncrStore } from '$stores/user';

  $: user = $userEncrStore!;
  $: textSlotWidth = $media.mobile ? 300 : 400;
</script>

{#if $inviteToValidate}
  <OwnerFlow inviteToValidate={$inviteToValidate} userId={user.id} />
{/if}

<Onboarding noSlot shouldShow key="contactUs" {textSlotWidth} let:finishOnboarding>
  <svelte:fragment slot="text">
    <Text header>{$_('cmps.wallet.onboarding.contactUs.title')}</Text>
    <Text
      >{@html $_('cmps.wallet.onboarding.contactUs.text', {
        values: {
          ...accentTags,
          ...generateLinkTags(`mailto:${founderEmail}`),
          email: founderEmail,
        },
      })}</Text>
    <button class="button mt-3" on:click={finishOnboarding}
      >{$_('cmps.wallet.onboarding.contactUs.cta')}</button>
  </svelte:fragment>
</Onboarding>

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
