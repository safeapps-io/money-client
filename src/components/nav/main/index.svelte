<script>
  import LoadingIndicator from '$components/nav/loadingIndicator.svelte';
  import StartPasswordRequest from '$components/user/startPasswordRequest.svelte';
  import JoiningFlow from '$components/wallet/joinWallet/joiningFlow.svelte';
  import PlanOfferModal from '$components/billing/planOfferModal.svelte';
  import ProblemsInitialOnboarding from '$components/onboarding/initial/problemsInitialOnboarding.svelte';
  import WalletDataContainer from './walletDataContainer.svelte';
  import LimitEntities from '$components/billing/limitEntities.svelte';

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  import { AuthService } from '$services/auth/authService';
  import { isOnlineStore } from '$stores/isOnline';
  import { userEncrStore } from '$stores/user';
  import { encryptionKeysStateStore } from '$stores/encr/keysState';
  import { walletStore } from '$stores/wallet';
  import { walletDataStore } from '$stores/decr/wallet';
  import { userDecrStore } from '$stores/decr/user';
  import { initApplicationLogic } from '$stores/init';
  import { addVisit } from '$stores/visitRecorder';
  import { appPath, loginPath } from '$core/routes';

  let remoteCheckPerformed = false,
    remoteCheckResult = false;
  onMount(async () => {
    remoteCheckResult = await AuthService.init();
    remoteCheckPerformed = true;
  });
  // If user check was performed but we have no user, we need to redirect to login page
  $: if (remoteCheckPerformed && !$userEncrStore) goto(loginPath, { replaceState: true });

  $: shouldShow = remoteCheckPerformed && remoteCheckResult && $userEncrStore;

  let tracked = false;
  $: if (hasWalletData && !tracked) {
    addVisit('visit');
    tracked = true;
  }

  $: user = $userEncrStore!;
  $: shouldShow && $initApplicationLogic;

  $: hasWallets = !!Object.keys($walletStore || {}).length;
  $: hasWalletData = !!Object.keys($walletDataStore || {}).length;

  $: invite = atob($page.query.get('invite') || '');
</script>

<!-- Whole flow is explained in ./planFlow.jpg -->
{#if shouldShow}
  {#if !$encryptionKeysStateStore.encryptionKeySet && !$userDecrStore}
    <StartPasswordRequest {user} />
  {:else if invite}
    <JoiningFlow {invite} on:success={() => goto(appPath)} />
  {:else if hasWallets}
    <!-- There's a point when we have wallets, but `walletData` is not yet decrypted -->
    {#if hasWalletData}
      <LimitEntities />
      <WalletDataContainer>
        <slot />
      </WalletDataContainer>
      <PlanOfferModal />
    {/if}
  {:else}
    <ProblemsInitialOnboarding />
  {/if}

  <LoadingIndicator show={!$isOnlineStore} />
{/if}
