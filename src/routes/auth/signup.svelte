<script>
  import SignupForm from '@/components/auth/signup.svelte';

  import { stores, goto } from '@sapper/app';
  import { appPath } from '@/core/routes';

  const { page } = stores();

  let invite: string | undefined = undefined;
  $: try {
    invite = atob($page.query.invite);
  } catch (e) {}

  const success = ({ detail: isWalletInvite }: CustomEvent<boolean>) =>
    goto(isWalletInvite ? appPath + window.location.search : appPath);
</script>

<SignupForm on:success={success} {invite} />
