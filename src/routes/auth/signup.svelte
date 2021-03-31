<script>
  import SignupForm from '$components/auth/signup.svelte';

  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { appPath } from '$core/routes';

  let invite: string | undefined = undefined;
  $: try {
    invite = atob($page.params.invite);
  } catch (e) {}

  const success = ({ detail: isWalletInvite }: CustomEvent<boolean>) =>
    goto(isWalletInvite ? appPath + window.location.search : appPath);
</script>

<SignupForm on:success={success} {invite} />
