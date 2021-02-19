<script>
  import type { OmitCommonFields, Transaction } from '@/stores/decr/types';

  import { createEventDispatcher } from 'svelte';

  import TransactionList from '@/components/transaction/list.svelte';
  import ResolvedTransaction from './transaction.svelte';

  import { CsvParsedTransactionResolution } from '@/core/import/constants';
  import { defaultWalletUserIdStore } from '@/stores/decr/walletUser';

  const dispatch = createEventDispatcher();

  export let transactions: OmitCommonFields<Transaction>[],
    currResolution: CsvParsedTransactionResolution;
</script>

<TransactionList
  transactions={transactions.slice().reverse()}
  let:transaction
  let:category
  let:walletUser
  let:showDelimiter
  let:originalIndex>
  <ResolvedTransaction
    {transaction}
    {category}
    {walletUser}
    {showDelimiter}
    defaultWalletUserId={$defaultWalletUserIdStore}
    on:success={e =>
      dispatch('success', {
        ...e.detail,
        // The list is reversed. To calculate real index we subtract the index of the item in the resersed
        // list from list's length. E.g., [0, 1, 2], length: 3, 2 has index 0. 3 - (2 + 1) = index 0 in the
        // original array.
        index: transactions.length - (originalIndex + 1),
        oldResolution: currResolution,
      })} />
</TransactionList>
