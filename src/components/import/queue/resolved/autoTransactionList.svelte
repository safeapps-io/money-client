<script>
  import type { OmitCommonFields, Transaction } from '@/stores/decr/types';

  import ResolvedTransactionList from './transactionList.svelte';

  import { _ } from 'svelte-i18n';
  import { CsvParsedTransactionResolution } from '@/core/import/constants';

  export let transactionsWithResolution: {
    transaction: OmitCommonFields<Transaction>;
    resolution: CsvParsedTransactionResolution.auto | CsvParsedTransactionResolution.save;
  }[];

  $: hasAuto = transactionsWithResolution.some(
    ({ resolution }) => resolution == CsvParsedTransactionResolution.auto,
  );

  let showAutoOnly = false;
  $: transactions = transactionsWithResolution
    .filter(({ resolution }) =>
      showAutoOnly ? resolution == CsvParsedTransactionResolution.auto : true,
    )
    .map(({ transaction }) => transaction);
</script>

{#if hasAuto}
  <label class="checkbox mb-5">
    {$_('cmps.import.queue.autoOnly')}
    <input type="checkbox" bind:checked={showAutoOnly} />
    <span class="check" />
  </label>
{/if}

<ResolvedTransactionList
  {transactions}
  currResolution={CsvParsedTransactionResolution.save}
  on:success />
