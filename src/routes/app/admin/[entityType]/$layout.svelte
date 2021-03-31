<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { appPath } from '$core/routes';

  const allowedEntityTypes = ['metaCategory', 'scheme'];
  $: if (!allowedEntityTypes.includes($page.params.entityType)) goto(appPath);
  else show = true;

  let show = false;
</script>

{#if show}
  <slot />
{/if}
