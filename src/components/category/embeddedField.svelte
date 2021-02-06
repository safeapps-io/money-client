<script>
  import type { Choices, FormStore } from '@/components/strict/base';
  import type { Transaction, FullEntity, Category, OmitCommonFields } from '@/stores/decr/types';

  import Modal from '@/components/elements/modal.svelte';
  import CategoryForm from './form.svelte';
  import { Field, SelectInput } from '@/components/strict';

  import { _ } from 'svelte-i18n';
  import { tick, getContext } from 'svelte';

  import { focusableShortcut } from '@/utils/actions/shortcut';

  export let ent = undefined as Transaction | OmitCommonFields<Transaction> | undefined,
    categoryChoices: Choices = [] as Choices,
    isIncomeCategory: boolean = false as boolean;

  const formStore = getContext('form') as FormStore,
    fieldname = 'categoryId',
    success = (e: CustomEvent<FullEntity<Category>>) => {
      active = false;
      /**
       * For some reason animation is very laggy if we try to change the value too soon.
       * tick() won't help in this case, but timeout works just fine.
       */
      tick().then(() => ($formStore.fields[fieldname].inputValue = e.detail.id));
    };

  let active = false;
  $: field = {
    name: fieldname,
    inputValue: ent?.categoryId || null,
    label: $_('cmps.category.common.category'),
    choices: categoryChoices,
  };
</script>

<Modal bind:active>
  <CategoryForm {isIncomeCategory} on:success={success} />
</Modal>
<Field {field}>
  <SelectInput />
  <p class="help" slot="help">
    <span
      class="has-text-dotted has-text-link clickable"
      role="button"
      tabindex="0"
      on:click={() => (active = true)}
      use:focusableShortcut>{$_('common.form.create')}</span>
  </p>
</Field>
