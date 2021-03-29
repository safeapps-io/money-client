<script>
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  import { userEncrStore } from '@/stores/user';
  import { appPath, signupPath } from '@/core/routes';

  onMount(() => {
    const invite = $page.params.token,
      invitePart = `?invite=${invite}`;

    goto($userEncrStore ? `${appPath}${invitePart}` : `${signupPath}${invitePart}`, {
      replaceState: true,
    });
  });
</script>
