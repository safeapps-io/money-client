<script>
  import { goto } from '@sapper/app';
  import { onMount } from 'svelte';

  import { appPath, loginPath } from '@/core/routes';
  import { userEncrStore } from '@/stores/user';

  onMount(() => goto($userEncrStore ? appPath : loginPath, { replaceState: true }));
</script>
