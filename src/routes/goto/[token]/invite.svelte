<script>
  import { goto, stores } from '@sapper/app';
  import { onMount } from 'svelte';

  import { appPath, signupPath } from '@/core/routes';
  import { tokenStore } from '@/stores/token';
  import { userEncrStore } from '@/stores/user';

  const { page } = stores();

  onMount(() => {
    const invite = $page.params.token,
      userIsSet = !!($tokenStore && $userEncrStore),
      invitePart = `?invite=${invite}`;

    goto(userIsSet ? `${appPath}${invitePart}` : `${signupPath}${invitePart}`, {
      replaceState: true,
    });
  });
</script>
