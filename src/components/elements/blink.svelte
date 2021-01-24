<script>
  import cssVars from 'svelte-css-vars';
  import { fade } from 'svelte/transition';

  export let key: any,
    duration = 250,
    delay = 150,
    bgColor = 'hsla(60, 100%, 70%, 0.2)';

  let show = false,
    timeout: number,
    latestKey = key;

  $: if (key != latestKey) {
    clearTimeout(timeout);
    show = true;
    timeout = window.setTimeout(() => (show = false), duration + delay);
  }
</script>

<style lang="scss">
  .blink-overlay {
    top: 0;
    bottom: 0;

    background-color: var(--bgColor);
  }
</style>

<div class="is-relative" use:cssVars={{ bgColor }}>
  <slot />
  {#if show}
    <div class="fullwidth-absolute blink-overlay" transition:fade|local={{ duration }} />
  {/if}
</div>
