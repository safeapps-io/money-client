<script>
  import Meta from '$components/nav/meta.svelte';
  import Main from '$components/nav/main/index.svelte';

  import { dev } from '$app/env';

  import { userEncrStore } from '$stores/user';
</script>

{#if $userEncrStore?.isAdmin || dev || process.env.STAGE}
  {#await import('$components/admin/settings.svelte') then Cmp}
    <Cmp.default />
  {/await}
{/if}

<Meta title="[safe] money" />
<Main>
  <slot />
</Main>
