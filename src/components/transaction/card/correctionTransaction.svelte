<script>
  import type { CorrectionTransaction } from '$stores/decr/types';

  import AmountDisplay from './amountDisplay.svelte';

  import { _ } from 'svelte-i18n';

  import { defaultAssetStore } from '$stores/decr/asset';
  import { relativeDate } from '$core/i18n/relativeDate';

  export let transaction: CorrectionTransaction;
</script>

<div class="level is-mobile mb-0">
  <div class="level-left">
    <div class="level-item mr-1">
      <div>
        <AmountDisplay amount={transaction.amount} assetCode={$defaultAssetStore.decr.code} />
        <p class="has-text-grey">{$_('cmps.transaction.correction.header')}</p>
      </div>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item">
      <p class="has-text-grey is-size-7">{$relativeDate(transaction.datetime)}</p>
    </div>
  </div>
</div>
