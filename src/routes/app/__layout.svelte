<script>
  import Meta from '$components/nav/meta.svelte';
  import Main from '$components/nav/main/index.svelte';

  import { userEncrStore } from '$stores/user';
</script>

{#if $userEncrStore?.isAdmin}
  {#await import('$components/admin/settings.svelte') then Cmp}
    <Cmp.default />
  {/await}
{/if}

<Meta title="[safe] money" />
<Main>
  <slot />
</Main>
