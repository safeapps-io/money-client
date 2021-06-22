<script>
  import type { FullEntity, SearchFilter } from '$stores/decr/types';
  import type { DisplayTransactionReturn } from '$core/analytics/displayTransactionsPlugin';
  import type { IncomeAndExpenseReturn } from '$core/analytics/incomeAndExpensePlugin';
  import type { CategorySplitReturn } from '$core/analytics/categorySplitPlugin';
  import type { BalanceHistoryReturn } from '$core/analytics/balanceHistoryPlugin';
  import type { WalletUserSplitReturn } from '$core/analytics/walletUserSplitPlugin';
  import type { IteratorPlugin } from '$core/analytics/types';

  import ZeroData from '$components/elements/zeroData.svelte';
  import TransactionListWithLinks from '$components/transaction/listWithLinks.svelte';
  import StatBox from '$components/dashboard/statBox.svelte';
  import Balance from '$components/dashboard/balance.svelte';
  import WalletUserStats from '$components/dashboard/walletUserStats.svelte';
  import CategoryStats from '$components/dashboard/categoryStats.svelte';
  import EditBalanceModalForm from '$components/wallet/editBalanceModalForm.svelte';

  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { balanceInfluencingTransactionsStore } from '$stores/decr/balanceInfluencingTransactions';
  import { currentWalletDataStore } from '$stores/decr/wallet';

  import { transactionIterator } from '$core/analytics/iterator';
  import { displayTransactionsPlugin } from '$core/analytics/displayTransactionsPlugin';
  import { balanceHistoryPlugin } from '$core/analytics/balanceHistoryPlugin';
  import { incomeAndExpensePlugin } from '$core/analytics/incomeAndExpensePlugin';
  import { categorySplitPlugin } from '$core/analytics/categorySplitPlugin';

  import { getTransactionFilter } from '$core/searchFilter/getTransactionFilter';
  import { shouldShowBalance } from '$core/searchFilter/shouldShowBalance';
  import { walletUserSplitPlugin } from '$core/analytics/walletUserSplitPlugin';

  export let searchFilter: FullEntity<SearchFilter>,
    dates: { startDate: number; endDate: number; prevStartDate?: number };

  $: walletShouldShowBalance = shouldShowBalance({
    searchFilter,
    walletData: $currentWalletDataStore,
  });
  $: filterFn = getTransactionFilter({
    searchFilter,
    shouldShowBalance: walletShouldShowBalance,
  });

  let transactions: DisplayTransactionReturn = [],
    incomeAndExpense: IncomeAndExpenseReturn = { income: 0, expense: 0 },
    categoryStats: CategorySplitReturn = { curr: [], prev: [] },
    walletUserStats: Partial<WalletUserSplitReturn> = {},
    balance: BalanceHistoryReturn | undefined = undefined;
  $: {
    const args: [number, number, number | undefined] = [
      dates.startDate,
      dates.endDate,
      dates.prevStartDate,
    ];
    // We need to reinitiate them every time anything changes, because plugins hold mutable state
    const plugins: IteratorPlugin<any>[] = [
      displayTransactionsPlugin(...args),
      incomeAndExpensePlugin(...args),
      categorySplitPlugin(...args),
      walletUserSplitPlugin(...args),
    ];
    if (walletShouldShowBalance)
      plugins.push(
        balanceHistoryPlugin(
          dates.startDate,
          dates.endDate,
          $currentWalletDataStore.decr.activeTransactionId,
        ),
      );

    [transactions, incomeAndExpense, categoryStats, walletUserStats, balance] = transactionIterator(
      $balanceInfluencingTransactionsStore,
      filterFn,
      plugins,
    );
  }

  let balanceFormActive = false;

  let isIncome = false;
  $: walletUserStatByType = isIncome ? walletUserStats.curr?.income : walletUserStats.curr?.expense;
</script>

<div class="wrapper">
  {#if balance}
    <div class="balance" transition:slide|local>
      <EditBalanceModalForm bind:active={balanceFormActive} oldBalance={balance.balance} />
      <div class="box box--hoverable">
        <Balance
          balanceNumber={balance.balance}
          balanceComparison={balance.balanceComparison}
          balanceHistory={balance.history}
          on:correctBalance={() => (balanceFormActive = true)} />
      </div>
    </div>
  {/if}

  {#if $balanceInfluencingTransactionsStore.length}
    <div class="box box--hoverable expense">
      <StatBox
        label={$_('cmps.transaction.common.expense')}
        labelClass="has-text-danger"
        betterToIncrease={false}
        currentValue={incomeAndExpense.expense}
        previousValue={incomeAndExpense.prevExpense} />
    </div>
    <div class="box box--hoverable income">
      <StatBox
        label={$_('cmps.transaction.common.income')}
        labelClass="has-text-success"
        betterToIncrease
        currentValue={incomeAndExpense.income}
        previousValue={incomeAndExpense.prevIncome} />
    </div>

    <div class="box box--hoverable category-split">
      <CategoryStats bind:isIncome currStats={categoryStats.curr} />
    </div>
    {#if (walletUserStatByType?.length || 0) > 1}
      <div class="box box--hoverable user-split" transition:slide|local>
        <WalletUserStats stats={walletUserStatByType} />
      </div>
    {/if}
    <div class="box transactions">
      <h2 class="title">
        {$_('cmps.transaction.common.count', { values: { count: transactions.length } })}
      </h2>
      <TransactionListWithLinks {transactions} />
    </div>
  {:else}
    <div class="full">
      <ZeroData text={$_('cmps.dashboard.zeroData') + ' 😊'} />
    </div>
  {/if}
</div>

<style lang="scss">
  .wrapper {
    display: grid;

    min-height: 0;
    min-width: 0;

    > div {
      min-width: 0;
      margin: 0.75rem;
    }
  }

  @include mq($from: tablet) {
    .wrapper {
      grid-template-columns: 2fr 2fr 3fr;
      grid-template-rows: auto auto auto 1fr;
    }
    .balance {
      grid-area: 1 / 1 / 2 / 3;
    }
    .expense {
      grid-area: 2 / 1 / 3 / 2;
    }
    .income {
      grid-area: 2 / 2 / 3 / 3;
    }
    .category-split {
      grid-area: 3 / 1 / 4 / 3;
      align-self: start;
    }
    .user-split {
      grid-area: 4 / 1 / 5 / 3;
      align-self: start;
    }
    .transactions {
      grid-area: 1 / 3 / 5 / 4;
      align-self: start;
    }

    .full {
      grid-area: 1 / 1 / 1 / 4;
    }
  }
</style>
