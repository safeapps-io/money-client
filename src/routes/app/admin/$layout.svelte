<script>
  import { goto } from '$app/navigation';

  import { appPath } from '$core/routes';
  import { userEncrStore } from '$stores/user';

  $: show = $userEncrStore?.isAdmin;

  $: !show && goto(appPath);
</script>

{#if show}
  <div class="warning">! admin !</div>

  <slot />
{/if}

<style lang="scss">
  .warning {
    position: fixed;
    top: 0;
    left: 50%;

    z-index: 100000;

    padding: 0.1em 2em;
    transform: translateX(-50%);

    background-color: rgb(255, 134, 134);
    color: white;
    border-radius: 0 0 3px 3px;
  }
</style>
