<script>
  import type { SearchFilter, FullEntity } from '$stores/decr/types';

  import { _ } from 'svelte-i18n';

  export let searchFilter: FullEntity<SearchFilter>, edit: boolean;
</script>

<div class="main">
  <div class="title-block">
    <h1 class="title overflow-ellipsis">
      {searchFilter.decr.protected
        ? $_('cmps.searchFilter.allTransactions')
        : searchFilter.decr.name}
    </h1>
  </div>
  <div class="edit-button">
    <button class="button is-text" on:click={() => (edit = !edit)}
      >{$_('common.form.change')}</button>
  </div>
</div>

<style lang="scss">
  .main {
    display: flex;
  }

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
