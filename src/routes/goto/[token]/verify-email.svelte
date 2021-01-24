<script>
  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';

  import { verifyEmailPath } from '@/core/routes';

  const { page } = stores();
  onMount(() => goto(verifyEmailPath($page.params.token)));
</script>
