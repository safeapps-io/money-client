<script>
  import type { Transaction, CorrectionTransaction, OmitCommonFields } from '@/stores/decr/types';

  import Pagination from '@/components/elements/pagination.svelte';
  import ZeroData from '@/components/elements/zeroData.svelte';

  import { _ } from 'svelte-i18n';
  import cssVars from 'svelte-css-vars';

  import { currentWalletCategoryStore } from '@/stores/decr/category';
  import { currentWalletUserStore } from '@/stores/decr/walletUser';

  type Tr = OmitCommonFields<Transaction> | OmitCommonFields<CorrectionTransaction>;

  export let transactions: Tr[];

  $: categories = $currentWalletCategoryStore;
  $: walletUsers = $currentWalletUserStore;
</script>

<Pagination items={transactions} let:item={transaction} let:index let:originalIndex>
  <div
    use:cssVars={{
      categoryBorder: `4px solid ${categories[transaction.categoryId]?.decr.color || '#f0f0f0'}`,
      delimiterColor: '#dbdbdb',
    }}>
    <slot
      {transaction}
      {index}
      {originalIndex}
      category={'categoryId' in transaction && transaction.categoryId
        ? categories[transaction.categoryId]
        : undefined}
      walletUser={'walletUserId' in transaction ? walletUsers[transaction.walletUserId] : undefined}
      showDelimiter={index} />
  </div>

  <div slot="zero">
    <ZeroData text={$_('cmps.transaction.zeroData')} />
  </div>
</Pagination>
