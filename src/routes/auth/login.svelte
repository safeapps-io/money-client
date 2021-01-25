<script>
  import LoginForm from '@/components/auth/login.svelte';

  import { goto, stores } from '@sapper/app';

  import { appPath } from '@/core/routes';

  const { page } = stores();
  $: queryParams = $page.query ? window.location.search : '';
</script>

<!--
  We always forward invite from login page. There's two cases:
  1. it's either a wallet invite and we need it on the app path
  2. it is not, but user seems to be thinking it is. We need to tell him than.
-->
<LoginForm on:success={() => goto(appPath + queryParams)} />
