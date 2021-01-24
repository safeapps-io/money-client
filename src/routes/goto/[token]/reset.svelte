<script>
  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';

  import { resetPasswordTokenPath } from '@/core/routes';

  const { page } = stores();
  onMount(() => goto(resetPasswordTokenPath($page.params.token)));
</script>
