<script context="module">
  type Tr = OmitCommonFields<Transaction> | OmitCommonFields<CorrectionTransaction>;

  function transactionTypeGuard(tr: Tr): tr is OmitCommonFields<Transaction> {
    return 'categoryId' in tr;
  }
</script>

<script>
  import type {
    Transaction,
    CorrectionTransaction,
    OmitCommonFields,
    Category,
    WalletUser,
    FullEntity,
  } from '$stores/decr/types';

  import Pagination from '$components/elements/pagination.svelte';
  import ZeroData from '$components/elements/zeroData.svelte';

  import { _ } from 'svelte-i18n';
  import cssVars from 'svelte-css-vars';

  import { currentWalletCategoryStore } from '$stores/decr/category';
  import { currentWalletUserStore } from '$stores/decr/walletUser';

  type Item = $$Generic<Tr>;

  interface $$Slots {
    default: {
      transaction: Item;
      index: number;
      originalIndex: number;
      category: FullEntity<Category> | undefined;
      walletUser: FullEntity<WalletUser> | undefined;
      showDelimiter: boolean;
    };
  }

  export let transactions: Item[];

  $: categories = $currentWalletCategoryStore;
  $: walletUsers = $currentWalletUserStore;

  $: getCategoryColor = (tr: Item) => {
    let color = '#f0f0f0';
    if (transactionTypeGuard(tr) && tr.categoryId && categories[tr.categoryId])
      color = categories[tr.categoryId].decr.color;

    return color;
  };
</script>

<Pagination items={transactions} let:item={transaction} let:index let:originalIndex>
  <div
    use:cssVars={{
      categoryBorder: `4px solid ${getCategoryColor(transaction)}`,
      delimiterColor: '#dbdbdb',
    }}>
    <slot
      {transaction}
      {index}
      {originalIndex}
      category={transactionTypeGuard(transaction) && transaction.categoryId
        ? categories[transaction.categoryId]
        : undefined}
      walletUser={transactionTypeGuard(transaction)
        ? walletUsers[transaction.walletUserId]
        : undefined}
      showDelimiter={!!index} />
  </div>

  <ZeroData slot="zero" text={$_('cmps.transaction.zeroData')} />
</Pagination>
