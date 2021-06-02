<script>
  import { fade } from 'svelte/transition';

  export let triggerText = '?',
    showTooltip = true,
    className: string = '';

  const enter = () => (show = true),
    leave = () => (show = false);

  let show = false;
</script>

<div
  class="tooltip {className}"
  on:mouseenter={enter}
  on:touchstart={enter}
  on:mouseleave={leave}
  on:touchend={leave}>
  <slot name="trigger">
    <span class="trigger">{triggerText}</span>
  </slot>
  <div class="is-relative">
    {#if showTooltip && show}
      <div class="tooltip-content" transition:fade|local={{ duration: 300 }}>
        <div class="content px-3 py-2 is-size-7">
          <slot />
        </div>
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  .tooltip {
    :global(span) {
      cursor: pointer;
    }

    :global(span.trigger) {
      padding-bottom: 1px;
      border-bottom: 1px dotted $turquoise;
    }
  }

  $width: 350px;

  .tooltip-content {
    position: absolute;
    top: 100%;

    @include mq($until: tablet) {
      left: -1em;
      right: -1em;
    }

    @include mq($from: tablet) {
      max-width: $width;
      left: 0;
      right: 0;
    }

    @include z(tooltip-content);
  }

  .content {
    display: inline-block;
    left: 0;
    right: 0;

    background-color: $scheme-main;

    box-shadow: 0 1em 1em -0.6em change-color($turquoise, $alpha: 0.3);
    background-color: rgb(250, 250, 250);
  }
</style>
