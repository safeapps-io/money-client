<script>
  import type { Category, FullEntity } from '$stores/decr/types';

  import Modal from '$components/elements/modal.svelte';
  import { Form, Field, SelectInput } from '$strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { categoryStore } from '$stores/decr/category';
  import {
    bulkReplaceCategories,
    transactionCountByCategoryStore,
  } from '$stores/decr/transaction';

  const dispatch = createEventDispatcher();

  export let ent: FullEntity<Category>, active: boolean;

  $: oldCategoryTransactionCount = $transactionCountByCategoryStore[ent.id] ?? 0;
  $: offerForm = oldCategoryTransactionCount && field.choices.length;

  let showForm = false;

  // Resetting flag after modal is closed on the second step
  $: showForm && !active && (showForm = false);

  $: field = {
    name: 'categoryId',
    label: $_('cmps.category.delete.newCategory'),
    choices: Object.values($categoryStore[ent.walletId])
      .filter(cat => cat.id !== ent.id && cat.decr.isIncome == ent.decr.isIncome)
      .map(cat => ({
        value: cat.id,
        label: cat.decr.name,
      })),
  };

  const launchDelete = () => dispatch('delete'),
    switchCategory = async ({ categoryId }: { categoryId: string }) => {
      await bulkReplaceCategories({
        oldCategoryId: ent.id,
        newCategoryId: categoryId,
        walletId: ent.walletId,
      });
      launchDelete();
    };
</script>

<Modal bind:active>
  <h2 class="subtitle">{$_('cmps.category.delete.title')}</h2>

  <p class="has-text-weight-bold">{$_('cmps.deleteEntity.irreversible')}</p>
  {#if offerForm && !showForm}
    <p>
      {$_('cmps.category.delete.categoryAssignedTo', {
        values: { count: oldCategoryTransactionCount },
      })}
    </p>
  {/if}

  {#if showForm}
    <Form success={switchCategory} buttonText={$_('cmps.category.delete.replace')}>
      <Field {field}>
        <SelectInput />
      </Field>
    </Form>
  {:else}
    <div class="columns is-vcentered mt-5">
      <div class="column">
        {#if offerForm}
          <button class="button is-success is-outlined" on:click={() => (showForm = true)}>
            {$_('cmps.category.delete.replace')}
          </button>
          <p>{$_('common.or').toLowerCase()}</p>
        {/if}
        <div>
          <button class="button is-danger is-outlined" on:click={launchDelete}
            >{$_('cmps.deleteEntity.delete')}</button>
        </div>
      </div>
      <div class="column is-narrow">
        <button class="button" on:click={() => (active = false)}>{$_('common.form.cancel')}</button>
      </div>
    </div>
  {/if}
</Modal>
