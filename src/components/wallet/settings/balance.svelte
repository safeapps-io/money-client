<script>
  import type { FullEntity, WalletData } from '$stores/decr/types';

  import ReferenceTransactionList from './referenceTransactionList.svelte';
  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { walletDataUpdate } from '$stores/decr/wallet';
  import { currentWalletReferenceTransactionStore } from '$stores/decr/referenceTransaction';

  export let wallet: FullEntity<WalletData>;

  let checked = wallet.decr.balance;
  $: if (checked != wallet.decr.balance)
    walletDataUpdate({ ent: wallet, decr: { ...wallet.decr, balance: checked } });

  $: transactions = Object.values($currentWalletReferenceTransactionStore);
</script>

<Onboarding preventSlotClick key="balance" shouldShow={!checked} let:finishOnboarding>
  <div class="field">
    <label class="checkbox">
      {$_('cmps.transaction.reference.balanceOn')}
      <input type="checkbox" bind:checked />
      <span class="check" />
    </label>
  </div>

  <svelte:fragment slot="text">
    <Text header>{$_('routes.wallet.balance')}</Text>
    <Text>{$_('cmps.transaction.reference.seeDynamics')}</Text>

    <button class="button mt-3" on:click={finishOnboarding}>{$_('common.allClear')}</button>
  </svelte:fragment>
</Onboarding>

{#if wallet.decr.balance}
  <div transition:slide|local>
    <ReferenceTransactionList {transactions} {wallet} />
  </div>
{/if}
