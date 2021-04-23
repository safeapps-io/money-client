<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { userBillingPath } from '$core/routes';

  onMount(() => goto(userBillingPath, { replaceState: true }));
</script>
