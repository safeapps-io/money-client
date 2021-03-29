<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import { unsubscribePath } from '$core/routes';

  onMount(() => goto(unsubscribePath($page.params.token), { replaceState: true }));
</script>
