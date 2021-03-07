<script>
  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';

  import { userEncrStore } from '@/stores/user';
  import { appPath, signupPath } from '@/core/routes';

  const { page } = stores();

  onMount(() => {
    const invite = $page.params.token,
      invitePart = `?invite=${invite}`;

    goto($userEncrStore ? `${appPath}${invitePart}` : `${signupPath}${invitePart}`, {
      replaceState: true,
    });
  });
</script>
