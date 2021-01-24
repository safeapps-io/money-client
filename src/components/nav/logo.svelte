<script>
  import { horizontalSlide } from '@/utils/horizontalSlide';

  let hovered = false;
  const mouseover = () => (hovered = true),
    mouseleave = () => (hovered = false);
</script>

<div class="wrapper is-size-4" on:mouseover={mouseover} on:mouseleave={mouseleave}>
  <div class="has-text-weight-bold">[</div>
  {#if hovered}
    <div class="is-clipped" transition:horizontalSlide={{ duration: 1200 }}>safe</div>
  {/if}
  <div class="has-text-weight-bold">]</div>

  <div class="ml-3">money</div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    place-content: center;
    justify-content: center;

    text-align: center;
    color: $turquoise;

    user-select: none;
  }
</style>
