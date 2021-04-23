<script>
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';

  import { appPath, signupPath } from '$core/routes';
  import { userEncrStore } from '$stores/user';

  onMount(() => goto($userEncrStore ? appPath : signupPath, { replaceState: true }));
</script>
