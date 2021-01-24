<script>
  import type {
    FullEntity,
    Transaction,
    CorrectionTransaction,
    WalletUser,
    Category,
  } from '@/stores/decr/types';

  import TransactionCard from './transactionCard.svelte';
  import CorrectionCard from './correctionTransaction.svelte';

  import { EntityTypes } from '@/stores/decr/types';

  export let transaction: Transaction | CorrectionTransaction,
    walletUser: FullEntity<WalletUser> | undefined = undefined,
    category: FullEntity<Category> | undefined = undefined;
</script>

<div class="px-2 py-2">
  {#if transaction.type === EntityTypes.correctionTransaction}
    <CorrectionCard {transaction} />
  {:else if transaction.type === EntityTypes.transaction}
    <TransactionCard {transaction} {category} {walletUser} />
  {/if}
</div>
