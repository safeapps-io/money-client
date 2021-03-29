<script>
  import type {
    FullEntity,
    Transaction,
    WalletUser,
    Category,
    OmitCommonFields,
  } from '$stores/decr/types';

  import FullAmountDisplay from './fullAmountDisplay.svelte';

  import { _ } from 'svelte-i18n';

  import { relativeDate } from '$core/i18n/relativeDate';

  export let transaction: Transaction | OmitCommonFields<Transaction>,
    walletUser: FullEntity<WalletUser> | undefined = undefined,
    category: FullEntity<Category> | undefined = undefined;
</script>

<div class="level is-mobile mb-0">
  <div class="level-left">
    <FullAmountDisplay {transaction} />
  </div>
  <div class="level-right">
    <div class="level-item">
      <p class="has-text-grey is-size-7">{$relativeDate(transaction.datetime)}</p>
    </div>
  </div>
</div>
<div class="level is-mobile">
  <div class="level-left">
    <div class="level-item">
      <p class="has-text-grey" class:is-italic={!category}>
        {category?.decr.name || $_('cmps.category.common.noCategory')}
      </p>
    </div>
  </div>
  <div class="level-right">
    <div class="level-item">
      <p class="level-item has-text-grey" class:is-italic={!walletUser}>
        {walletUser?.decr.name || $_('cmps.transaction.common.noUser')}
      </p>
    </div>
  </div>
</div>
