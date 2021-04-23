<script>
  import LoadingIndicator from '$components/nav/loadingIndicator.svelte';
  import StartPasswordRequest from '$components/user/startPasswordRequest.svelte';
  import WalletModalCreate from '$components/wallet/modalCreate.svelte';
  import ExpandableMenu from '$components/nav/expandableMenu.svelte';
  import Logo from '$components/nav/logo.svelte';
  import Menu from '$components/nav/menu.svelte';
  import JoiningFlow from '$components/wallet/joinWallet/joiningFlow.svelte';
  import OwnerFlow from '$components/wallet/joinWallet/ownerFlow.svelte';
  import PlanOfferModal from '$components/billing/planOfferModal.svelte';

  import { onMount, setContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { media } from 'svelte-match-media';
  import { fade } from 'svelte/transition';

  import { AuthService } from '$services/auth/authService';
  import { isOnlineStore } from '$stores/isOnline';
  import { userEncrStore } from '$stores/user';
  import { encryptionKeysStateStore } from '$stores/encr/keysState';
  import { walletStore } from '$stores/wallet';
  import { walletDataStore } from '$stores/decr/wallet';
  import { userDecrStore } from '$stores/decr/user';
  import { inviteToValidate } from '$services/invite/inviteStages';
  import { planGuardStore } from '$stores/billing';
  import { initApplicationLogic } from '$stores/init';
  import { appPath, loginPath } from '$core/routes';

  let remoteCheckPerformed = false,
    remoteCheckResult = false;
  onMount(async () => {
    remoteCheckResult = await AuthService.isUserStillValid();
    remoteCheckPerformed = true;
  });
  if ($encryptionKeysStateStore.encryptionKeySet)
    AuthService.isUserStillValid().then(res => (remoteCheckResult = res));
  // If user check was performed but we have no user, we need to redirect to login page
  $: if (remoteCheckPerformed && !$userEncrStore) goto(loginPath, { replaceState: true });

  $: shouldShow = remoteCheckPerformed && remoteCheckResult && $userEncrStore;

  $: user = $userEncrStore!;
  $: shouldShow && $initApplicationLogic;

  $: hasWallets = !!Object.keys($walletStore || {}).length;
  $: hasWalletData = !!Object.keys($walletDataStore || {}).length;

  $: invite = atob($page.query.get('invite') || '');

  let planCheck: {
      userCanBuy: boolean;
      planActive: boolean;
    } | null = null,
    showModal = false;
  setContext('isPlanActive', (currentUserCheck = false) => (e?: Event) => {
    if (!shouldShow) return false;

    planCheck = $planGuardStore(currentUserCheck);
    showModal = !planCheck.planActive;

    // Useful for links and other clickable stuff
    if (showModal && e) {
      e.preventDefault();
      e.stopPropagation();
    }

    return !showModal;
  });
</script>

{#if shouldShow}
  {#if $encryptionKeysStateStore.encryptionKeySet && $userDecrStore}
    {#if $inviteToValidate}
      <OwnerFlow inviteToValidate={$inviteToValidate} userId={user.id} />
    {/if}

    <!--
      If we have an invite, we immediately launch the process of joining the wallet.
      It would later redirect us to a page without a get-parameter.

      If no invite is present we check if we have wallets.
        If so, we open the dashboard.
        If not, we launch wallet creation wizard.
    -->
    {#if invite}
      <JoiningFlow {invite} on:success={() => goto(appPath)} />
    {:else if hasWallets}
      {#if hasWalletData}
        <main class="container fullheight">
          {#if $media.mobile}
            <div class="fullheight" in:fade={{ duration: 1200 }}>
              <ExpandableMenu>
                <slot />
              </ExpandableMenu>
            </div>
          {:else}
            <div class="columns pt-5 fullheight" in:fade={{ duration: 1200 }}>
              <div class="column is-3 aside">
                <a href={appPath}><Logo showAnimation /></a>
                <Menu />
              </div>
              <div class="column is-9">
                <slot />
              </div>
            </div>
          {/if}
        </main>
      {/if}
    {:else}
      <WalletModalCreate firstWallet active />
    {/if}
  {:else}
    <StartPasswordRequest {user} />
  {/if}

  <PlanOfferModal {planCheck} bind:showModal />

  <LoadingIndicator show={!$isOnlineStore} />
{/if}
