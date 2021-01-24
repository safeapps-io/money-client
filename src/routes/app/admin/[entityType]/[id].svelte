<script>
  import { goto, stores } from '@sapper/app';

  import Edit from '@/components/admin/crud/edit.svelte';
  import MetaCategoryFields from '@/components/admin/metaCategoryFields.svelte';
  import SchemeFields from '@/components/admin/schemeFields.svelte';

  import { AdminEntityPrefixes } from '@/core/admin/routes';
  import { adminEntityListPath } from '@/core/routes';

  const { page } = stores();

  $: entId = $page.params.id;
  $: prefix = $page.params.entityType;

  const redirect = () => goto(adminEntityListPath(prefix));
</script>

<Edit {entId} {prefix} on:success={redirect} let:ent>
  {#if prefix == AdminEntityPrefixes.category}
    <MetaCategoryFields {ent} />
  {:else if prefix == AdminEntityPrefixes.scheme}
    <SchemeFields {ent} />
  {/if}
</Edit>
