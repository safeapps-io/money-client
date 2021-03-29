<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import { resetPasswordTokenPath } from '$core/routes';

  onMount(() => goto(resetPasswordTokenPath($page.params.token), { replaceState: true }));
</script>
