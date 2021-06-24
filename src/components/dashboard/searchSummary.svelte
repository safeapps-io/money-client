<script>
  import type { SearchFilter, FullEntity } from '$stores/decr/types';

  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';

  import { hasUserSeenOnboarding } from '$stores/decr/user';
  import { currentWalletTransactionStore } from '$stores/decr/transaction';

  export let searchFilter: FullEntity<SearchFilter>, edit: boolean;

  $: shouldShow =
    $hasUserSeenOnboarding('howToAdd') && !!Object.keys($currentWalletTransactionStore).length;
</script>

<div class="is-flex">
  <div class="title-block">
    <h1 class="title overflow-ellipsis">
      {searchFilter.decr.protected
        ? $_('cmps.searchFilter.allTransactions')
        : searchFilter.decr.name}
    </h1>
  </div>
  <div class="edit-button">
    <Onboarding
      preventSlotClick
      bottom
      key="searchFilter"
      {shouldShow}
      let:finishOnboarding
      let:show>
      <button
        class="button is-text"
        class:has-background-white={show}
        on:click={() => {
          finishOnboarding();
          edit = !edit;
        }}>{$_('common.form.change')}</button>

      <svelte:fragment slot="text">
        <Text header>{$_('cmps.wallet.onboarding.search.header')}</Text>
        <Text>{$_('cmps.wallet.onboarding.search.change')}</Text>
        <Text>{$_('cmps.wallet.onboarding.search.example')}</Text>
        <Text>{$_('cmps.wallet.onboarding.search.save')}</Text>
        <button class="button is-small my-3" on:click={finishOnboarding}
          >{$_('common.okDok')}</button>
      </svelte:fragment>
    </Onboarding>
  </div>
</div>

<style lang="scss">
  .title-block {
    @include mq($until: tablet) {
      flex: 1;
    }
    @include mq($from: tablet) {
      flex: none;
      margin-right: 1em;
    }

    overflow: hidden;
  }

  .edit-button {
    flex: none;
  }
</style>
