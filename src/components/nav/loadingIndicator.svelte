<script>
  import { fade } from 'svelte/transition';

  export let show: boolean;

  let timer: number,
    realShow = show;
  // Debouncing the show prop, so the loading indicator won't show up too often after small changes
  $: if (show) timer = window.setTimeout(() => (realShow = true), 100);
  else {
    clearTimeout(timer);
    realShow = false;
  }
</script>

{#if realShow}
  <button class="button is-rounded is-color-loading is-static is-large" transition:fade />
{/if}

<style lang="scss">
  button {
    position: fixed;
    bottom: 65px;

    @supports (top: unquote('max(0px)')) {
      bottom: unquote('calc(65px + env(safe-area-inset-bottom))');
    }

    @include mq($from: tablet) {
      right: 85px;
    }

    @include mq($until: tablet) {
      left: 25px;
    }

    @include z(loading-button);
  }
</style>
