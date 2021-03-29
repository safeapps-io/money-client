<script>
  import Edit from '@/components/admin/crud/edit.svelte';
  import MetaCategoryFields from '@/components/admin/metaCategoryFields.svelte';
  import SchemeFields from '@/components/admin/schemeFields.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { AdminEntityPrefixes } from '@/core/admin/routes';
  import { adminEntityListPath } from '@/core/routes';

  $: prefix = $page.params.entityType;

  const redirect = () => goto(adminEntityListPath(prefix));
</script>

<Edit {prefix} on:success={redirect}>
  {#if prefix == AdminEntityPrefixes.category}
    <MetaCategoryFields />
  {:else if prefix == AdminEntityPrefixes.scheme}
    <SchemeFields />
  {/if}
</Edit>
