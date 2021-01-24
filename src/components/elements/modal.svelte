<script>
  import { media } from 'svelte-match-media';
  import { fade, scale, slide } from 'svelte/transition';

  import { shortcut } from '@/utils/actions/shortcut';
  import { restrictBodyScroll } from '@/utils/actions/restrictBodyScroll';

  /**
   * If true, then close button will be shown and clicking on the background would dismiss the modal.
   * If false, it would only close if you explicitly set `active` props to false.
   */
  export let canBeVoluntarilyClosed = true;

  export let active = false;

  /**
   * forceScale — forces the animation to be scale, not slide from bottom.
   *
   * noBox — does not add .box and sets the paddings of the content to minimum.
   */
  export let forceScale = false,
    noBox = false;

  const close = () => (active = false);

  $: isMobile = $media.mobile && !forceScale;
  $: transition = isMobile ? slide : scale;
</script>

{#if active}
  <div class="modal is-active">
    <div
      class="modal-background"
      on:click={() => canBeVoluntarilyClosed && close()}
      use:shortcut={{ code: 'Escape' }}
      transition:fade
    />
    <div
      class="modal-content"
      class:no-box={noBox || isMobile}
      class:box={!noBox}
      class:mobile-content={isMobile}
      use:restrictBodyScroll
      transition:transition
    >
      <slot />
    </div>

    {#if !isMobile && canBeVoluntarilyClosed}
      <button
        type="button"
        class="modal-close is-large"
        aria-label="close"
        on:click={close}
        transition:fade
      />
    {/if}
  </div>
{/if}

<style lang="scss">
  .box {
    padding: 2.7em 3em;
  }

  .no-box {
    padding: 0.7em;
  }

  .mobile-content {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;

    margin: 0;
    @include safeAreaPaddingMixin(bottom, 2em);
  }
</style>
