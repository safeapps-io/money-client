<script>
  import { fade } from 'svelte/transition';
</script>

<style lang="scss">
  .wrapper {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }
</style>

<div class="wrapper" transition:fade>
  <button class="button is-text is-color-loading is-large" readonly />
</div>
