<script>
  import Menu from './menu.svelte';

  import { fade } from 'svelte/transition';
  import { media } from 'svelte-match-media';
  import { page } from '$app/stores';
  import menuIcon from 'teenyicons/outline/menu.svg';

  import { restrictBodyScroll } from '@/utils/actions/restrictBodyScroll';

  import { hasUserSeenOnboarding } from '@/stores/decr/user';

  let showMenu = false;

  $: if ($page.path) showMenu = false;
  $: if (!$hasUserSeenOnboarding('howToAdd') && $media.mobile)
    setTimeout(() => (showMenu = true), 500);
</script>

<div class="page-content fullheight">
  <slot />
</div>

{#if showMenu}
  <div class="modal-background menu-z" transition:fade on:click={() => (showMenu = false)} />
{/if}

<button
  class="button is-rounded trigger-button"
  class:show-menu={showMenu}
  on:click={() => (showMenu = !showMenu)}>
  <span class="icon"> <img src={menuIcon} alt="menu" height="20" width="20" /> </span>
</button>

<div
  class="menu-content has-background-white-bis"
  class:show-menu={showMenu}
  aria-hidden={!showMenu}>
  <div class="pt-2 pb-4 px-2" use:restrictBodyScroll={showMenu}>
    <Menu {showMenu} />
  </div>
</div>

<style lang="scss">
  $button-size: 3.5em;
  $button-margin: 2em;
  // Equivalent of qubic-out (slide's default timing function)
  $transition: 400ms cubic-bezier(0.33, 1, 0.68, 1);

  $menu-height: 70%;

  .trigger-button {
    width: $button-size;
    height: $button-size;

    position: fixed;
    bottom: $button-margin;
    right: $button-margin;

    box-shadow: 0 0.5em 2em -0.25em rgba($scheme-invert, 0.2),
      0 0px 1em 4px rgba($scheme-invert, 0.1);
    transition: box-shadow $transition, bottom $transition !important;

    &.show-menu {
      bottom: calc(#{$menu-height} + #{$button-margin});
    }
  }

  .menu-content {
    position: fixed;
    right: 0;
    left: 0;
    bottom: 0;
    top: 100%;

    overflow: hidden;

    box-shadow: 0em 0em 1.5em 0em $grey-light;
    transition: top $transition;

    &.show-menu {
      top: 100% - $menu-height;
      overflow-y: scroll;
    }
  }

  /*
   * Adding bottom padding to offset the button.
   * Currently it is very ugly and also repeated in page.svelte (hense the CSS var),
   * but iOS Safari keeps ignoring the padding if it is only applied here. Desktop Safari
   * works fine, btw :)
   * 
   * I think this issue will be resolved automatically once we migrate to Grids.
   */
  .page-content {
    --buttonBottomPadding: #{$button-size + $button-margin};

    padding-bottom: var(--buttonBottomPadding);
  }

  .menu-z,
  .trigger-button,
  .menu-content {
    @include z(menu-back-and-trigger-button);
  }
</style>
