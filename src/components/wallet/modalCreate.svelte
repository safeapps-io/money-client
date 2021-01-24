<script>
  import Modal from '@/components/elements/modal.svelte';
  import WalletForm from './forms/wallet.svelte';
  import JointWalletForm from './forms/jointWallet.svelte';
  import { Onboarding, Text } from '@/components/onboarding/index';
  import Tabs from '@/components/elements/tabs.svelte';

  import { goto } from '@sapper/app';
  import { tick } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { searchIdPathFn } from '@/core/routes';
  import { defaultSearchFilter } from '@/stores/decr/searchFilter';

  export let firstWallet: boolean = false,
    active: boolean = false;

  const enum WalletCreateModes {
    wallet,
    jointWallet,
  }
  let mode: WalletCreateModes = WalletCreateModes.wallet;

  const created = async () => {
    active = false;
    await tick();
    if (!firstWallet) goto($searchIdPathFn($defaultSearchFilter.id));
  };
</script>

<Modal
  bind:active
  canBeVoluntarilyClosed={!firstWallet}
  noBox={firstWallet}
  forceScale={firstWallet}>
  {#if !firstWallet}
    <Tabs
      classes="is-centered"
      bind:activeTab={mode}
      tabs={[{ value: WalletCreateModes.wallet, label: $_('cmps.wallet.common.wallet') }, { value: WalletCreateModes.jointWallet, label: $_('cmps.wallet.common.jointWallet') }]} />
  {/if}

  {#if mode == WalletCreateModes.wallet}
    <h1 class="title">{$_('cmps.wallet.create.wallet')}</h1>
    <Onboarding shouldShow={firstWallet} key="firstWallet">
      <WalletForm on:created={created} alwaysCreateDefaultCategories={firstWallet} />

      <div slot="text">
        <Text header>{$_('cmps.wallet.common.wallets')}</Text>
        <Text>{$_('cmps.wallet.onboarding.main')}</Text>
      </div>
    </Onboarding>
  {:else}
    <h1 class="title">{$_('cmps.wallet.create.jointWallet')}</h1>
    <JointWalletForm on:created={created} />
  {/if}
</Modal>
