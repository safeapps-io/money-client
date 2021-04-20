<script>
  import type { FullEntity, Category } from '$stores/decr/types';

  import ZeroData from '$components/elements/zeroData.svelte';

  import { _ } from 'svelte-i18n';
  import cssVars from 'svelte-css-vars';
  import { flip } from 'svelte/animate';
  import { quintOut } from 'svelte/easing';

  import { transactionCountByCategoryStore } from '$stores/decr/transaction';
  import { categoryPathFn } from '$core/routes';

  export let categories: FullEntity<Category>[];
</script>

{#if categories.length}
  <div class="columns is-multiline">
    {#each categories as category (category.id)}
      <div class="column is-4" animate:flip={{ duration: 600, easing: quintOut }}>
        <a href={$categoryPathFn(category.id)}>
          <div class="box box--hoverable" use:cssVars={{ categoryColor: category.decr.color }}>
            <p class="is-size-6">{category.decr.name}</p>
            <p class="has-text-grey is-size-7">
              {$_('cmps.transaction.common.count', {
                values: { count: $transactionCountByCategoryStore[category.id] || 0 },
              })}
            </p>
          </div>
        </a>
      </div>
    {/each}
  </div>
{:else}
  <ZeroData text={$_('cmps.category.zeroData') + '😒'} />
{/if}

<style lang="scss">
  .box {
    border-left: 5px solid var(--categoryColor);
  }
</style>
