<script>
  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';

  import { unsubscribePath } from '@/core/routes';

  const { page } = stores();
  onMount(() => goto(unsubscribePath($page.params.token)));
</script>
