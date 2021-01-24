<script>
  import SignupForm from '@/components/auth/forms/signup.svelte';
  import CheckInvite from '@/components/auth/checkInvite.svelte';

  import { stores, goto } from '@sapper/app';

  import { appPath } from '@/core/routes';

  const { page } = stores();

  $: rawInvite = $page.query.invite;
  let invite: string | undefined = undefined;

  $: queryParams = $page.query ? window.location.search : '';

  const success = ({ detail: isWalletInvite }: CustomEvent<boolean>) =>
    goto(isWalletInvite ? appPath + queryParams : appPath);
</script>

{#if !invite}
  <CheckInvite
    {rawInvite}
    on:fail={() => (invite = undefined)}
    on:success={e => (invite = e.detail)} />
{/if}

<SignupForm on:success={success} {invite} />
