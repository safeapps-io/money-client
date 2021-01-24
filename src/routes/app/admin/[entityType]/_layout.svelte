<script>
  import { goto, stores } from '@sapper/app';
  import { appPath } from '@/core/routes';

  const { page } = stores();

  const allowedEntityTypes = ['metaCategory', 'scheme'];
  $: if (!allowedEntityTypes.includes($page.params.entityType)) goto(appPath);
  else show = true;

  let show = false;
</script>

{#if show}
  <slot />
{/if}
