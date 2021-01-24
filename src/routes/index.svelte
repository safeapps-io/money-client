<script>
  import { goto } from '@sapper/app';
  import { onMount } from 'svelte';

  import { tokenStore } from '@/stores/token';
  import { appPath, loginPath } from '@/core/routes';

  $: isAuthorized = !!$tokenStore?.accessToken;

  onMount(() => goto(isAuthorized ? appPath : loginPath));
</script>
