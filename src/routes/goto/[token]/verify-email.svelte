<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import { verifyEmailPath } from '$core/routes';

  onMount(() => goto(verifyEmailPath($page.params.token), { replaceState: true }));
</script>
