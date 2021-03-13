<script>
  import type { Writable } from 'svelte/store';

  import { _ } from 'svelte-i18n';
  import { getContext } from 'svelte';

  export let page = 1,
    limit = 10,
    items: any[];

  const resetPageKeyStore = getContext<Writable<string | null> | undefined>('resetPageKeyStore');

  // Resetting page when reset key changes
  $: if (resetPageKeyStore && $resetPageKeyStore) page = 1;

  // If items were changed with the same resetPageKey, we need to make sure the page does not overflow the list
  $: if (page > lastPage) page = lastPage;
  // It can get a negative value if it hits a zero data
  $: if (page <= 0) page = 1;

  $: lastPage = Math.ceil(items.length / limit);
  $: sliceStart = (page - 1) * limit;
  $: sliceEnd = page * limit;
</script>

{#each items.slice(sliceStart, sliceEnd) as item, index}
  <slot {item} {index} originalIndex={(page - 1) * limit + index} />
{:else}
  <slot name="zero" />
{/each}

{#if lastPage > 1}
  <nav class="is-flex mt-3">
    <button class="button is-small" disabled={page == 1} on:click={() => page--}
      >{$_('cmps.elements.pagination.prev')}</button>
    <p class="flex-full is-size-7 has-text-grey has-text-centered">
      {$_('cmps.elements.pagination.page', { values: { curr: page, last: lastPage } })}
    </p>
    <button class="button is-small" disabled={page == lastPage} on:click={() => page++}
      >{$_('cmps.elements.pagination.next')}</button>
  </nav>
{/if}
