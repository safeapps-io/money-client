<script>
  import LoadingIndicator from '@/components/nav/loadingIndicator.svelte';
  import StartPasswordRequest from '@/components/user/startPasswordRequest.svelte';
  import WalletModalCreate from '@/components/wallet/modalCreate.svelte';
  import ExpandableMenu from '@/components/nav/expandableMenu.svelte';
  import CurrentWalletDropdown from '@/components/wallet/currentWalletDropdown.svelte';
  import Logo from '@/components/nav/logo.svelte';
  import Menu from '@/components/nav/menu.svelte';
  import JoiningFlow from '@/components/wallet/joinWallet/joiningFlow.svelte';
  import OwnerFlow from '@/components/wallet/joinWallet/ownerFlow.svelte';

  import { goto, stores } from '@sapper/app';
  import { media } from 'svelte-match-media';
  import { fade } from 'svelte/transition';

  import { syncStatusStore, SyncStatuses } from '@/stores/sync';
  import { userEncrStore } from '@/stores/user';
  import { tokenStore } from '@/stores/token';
  import { encryptionKeysStateStore } from '@/stores/encr/keysState';
  import { walletStore } from '@/stores/wallet';
  import { walletDataStore } from '@/stores/decr/wallet';
  import { userDecrStore } from '@/stores/decr/user';
  import { inviteToValidate } from '@/services/invite/inviteStages';
  import { initApplicationLogic } from '@/stores/init';
  import { appPath, loginPath } from '@/core/routes';

  // Redirecting if user or token store are not present
  $: userIsSet = !!($tokenStore && $userEncrStore);
  $: if (!userIsSet) goto(loginPath);

  $: user = $userEncrStore!;
  $initApplicationLogic;

  $: hasWallets = !!Object.keys($walletStore || {}).length;
  $: hasWalletData = !!Object.keys($walletDataStore || {}).length;

  const { page } = stores();
  $: invite = atob($page.query.invite || '');
</script>

{#if userIsSet}
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
                <a href={appPath}><Logo /></a>

                <CurrentWalletDropdown />
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

  <LoadingIndicator show={$syncStatusStore !== SyncStatuses.finished} />
{/if}
