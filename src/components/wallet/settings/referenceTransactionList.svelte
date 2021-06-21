<script>
  import type { FullEntity, ReferenceTransaction, WalletData } from '$stores/decr/types';

  import ReferenceTransactionCard from '$components/transaction/card/referenceTransaction.svelte';
  import ReferenceTransactionForm from '$components/transaction/form/referenceTransactionForm.svelte';

  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { walletDataUpdate } from '$stores/decr/wallet';
  import { runCheck } from '$components/billing/planOfferModal.svelte';

  export let transactions: FullEntity<ReferenceTransaction>[], wallet: FullEntity<WalletData>;
  let showForm = !transactions.length;

  const setActive = ({ detail: refTransactionId }: { detail: string }) =>
      walletDataUpdate({
        ent: wallet,
        decr: { ...wallet.decr, activeTransactionId: refTransactionId },
      }),
    formSuccess = async ({ detail }: CustomEvent<FullEntity<ReferenceTransaction>>) => {
      await setActive({ detail: detail.id });
      showForm = false;
    };
</script>

<ul class="py-4">
  {#each transactions as tr, index (tr.id)}
    <li>
      {#if index > 0}
        <hr />
      {/if}
      <ReferenceTransactionCard
        referenceTransaction={tr}
        activeTransactionId={wallet.decr.activeTransactionId}
        on:setActive={setActive} />
    </li>
  {:else}
    <p class="help" out:slide|local>{$_('cmps.transaction.reference.unsetBalance')}</p>
  {/each}
</ul>
{#if showForm}
  <div transition:slide|local>
    <div class="pt-4">
      <ReferenceTransactionForm
        walletId={wallet.walletId}
        on:success={formSuccess}
        on:cancel={() => (showForm = false)} />
    </div>
  </div>
{:else}
  <div transition:slide|local>
    <button
      type="button"
      class="button is-light"
      on:click={() => runCheck() && (showForm = !showForm)}>
      {$_('common.form.set')}
    </button>
  </div>
{/if}
