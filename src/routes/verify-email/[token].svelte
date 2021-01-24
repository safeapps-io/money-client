<script>
  import { goto, stores } from '@sapper/app';

  import { loginPath } from '@/core/routes';

  import VerifyEmail from '@/components/user/verifyEmail.svelte';

  const { page } = stores(),
    redirect = () => goto(loginPath);

  $: emailToken = $page.params.token;
</script>

<VerifyEmail {emailToken} on:success={redirect} on:fail={redirect} />
