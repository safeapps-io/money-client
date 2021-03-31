<script>
  import type { FullEntity, Transaction, CorrectionTransaction } from '$stores/decr/types';

  import { focusableShortcut } from '$utils/actions/shortcut';

  import TransactionCard from './card/transactionCard.svelte';
  import TransactionList from './list.svelte';
  import TransactionForm from './form/transaction.svelte';
  import CorrectionTransactionForm from './form/balanceCorrection.svelte';
  import Modal from '$components/elements/modal.svelte';

  import { EntityTypes } from '$stores/decr/types';

  export let transactions: FullEntity<Transaction | CorrectionTransaction>[];
  $: decrTransactions = transactions.map(tr => tr.decr);

  let active = false,
    formTransaction: FullEntity<Transaction | CorrectionTransaction>;
  const toggleModal = (index: number) => {
      formTransaction = transactions[index];
      active = true;
    },
    hideModal = () => (active = false);

  const assertCorrection = (tr: FullEntity<Transaction | CorrectionTransaction>) =>
      tr as FullEntity<CorrectionTransaction>,
    assertUsual = (tr: FullEntity<Transaction | CorrectionTransaction>) =>
      tr as FullEntity<Transaction>;
</script>

<Modal bind:active>
  {#if formTransaction.decr.type == EntityTypes.transaction}
    <TransactionForm
      ent={assertUsual(formTransaction)}
      on:success={hideModal}
      on:delete={hideModal} />
  {:else}
    <CorrectionTransactionForm
      ent={assertCorrection(formTransaction)}
      on:success={hideModal}
      on:delete={hideModal} />
  {/if}
</Modal>

<TransactionList
  transactions={decrTransactions}
  let:transaction
  let:category
  let:walletUser
  let:originalIndex
  let:showDelimiter>
  <div
    class="wrapper box--hoverable p-2 clickable"
    class:no-border={!showDelimiter}
    role="button"
    tabindex="0"
    on:click={() => toggleModal(originalIndex)}
    use:focusableShortcut>
    <TransactionCard {transaction} {category} {walletUser} />
  </div>
</TransactionList>

<style lang="scss">
  .no-border {
    border-top-color: transparent !important;
  }

  .wrapper {
    display: block;

    background-color: white;

    border-top: 1px dotted var(--delimiterColor);
    border-left: var(--categoryBorder);

    transition: box-shadow, border, transform $visual-transition-settings;

    &:hover {
      @extend .no-border;
    }
  }
</style>
