<script>
  import type { ParsedTransaction } from '@/core/import/types';
  import type { OmitCommonFields, Transaction } from '@/stores/decr/types';

  import AmountDisplay from './amountDisplay.svelte';

  import { moneyFormat } from '@/utils/number';

  import { defaultAssetStore } from '@/stores/decr/asset';

  export let transaction: ParsedTransaction | Transaction | OmitCommonFields<Transaction>,
    assetCode: string = $defaultAssetStore.decr.code;
</script>

<div class="wrapper">
  <AmountDisplay {assetCode} amount={transaction.amount} />
  {#if transaction.originalAmount && transaction.currency && transaction.amount != transaction.originalAmount}
    <p class="has-text-grey-light is-size-7 pl-3">
      ({$moneyFormat(Math.abs(transaction.originalAmount), transaction.currency)})
    </p>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    place-items: center;
  }
</style>
