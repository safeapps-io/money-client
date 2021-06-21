<script>
  import Logo from '$components/nav/logo.svelte';
  import WalletModalCreate from '$components/wallet/modalCreate.svelte';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import YourProblems from './yourProblems.svelte';

  import { setUserSetting, userDecrStore } from '$stores/decr/user';

  $: key = $userDecrStore?.decr.settings?.userProblems?.length ? 2 : 1;

  const click = (e: CustomEvent<number[]>) => setUserSetting('userProblems', e.detail);
</script>

<CrossfadeWrapper {key}>
  {#if key === 1}
    <div class="pt-6 mb-6">
      <Logo />
    </div>

    <YourProblems on:problems={click} />
  {:else}
    <WalletModalCreate firstWallet active />
  {/if}
</CrossfadeWrapper>
