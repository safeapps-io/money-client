<script>
  import type { OmitCommonFields, Transaction } from '@/stores/decr/types';
  import type { FormStore, Choices } from '@/components/strict/base';

  import EmbeddedCategoryField from '@/components/category/embeddedField.svelte';
  import {
    Field,
    FieldContext,
    TextareaInput,
    TextInput,
    TagsField,
    SelectInput,
  } from '@/components/strict';

  import { _ } from 'svelte-i18n';
  import { getContext } from 'svelte';

  import { inputFormatDate } from '@/utils/date';
  import { moneyFormat } from '@/utils/number';

  import { optionalString, ensureString, oneOf } from '@/core/strict/string';
  import {
    ensureDate,
    dateIsBefore,
    dateIsAfter,
    ensureNumber,
    moreThan,
  } from '@/core/strict/number';
  import { ensureArray, uniqueOnly, maxArrLength } from '@/core/strict/array';
  import { categorySortedByTitleStore, currentWalletCategoryStore } from '@/stores/decr/category';
  import { currentWalletUserStore } from '@/stores/decr/walletUser';
  import { distinctTagNamesStore } from '@/stores/decr/transaction';
  import {
    autocompleteDataStore,
    transposeCountObjectToArray,
    noNestedObjectsKey,
  } from '@/stores/decr/autocomplete';

  export let ent = undefined as Transaction | OmitCommonFields<Transaction> | undefined,
    // Set choices for category select with popular and all categories
    suggestedCategoryIds = undefined as string[] | undefined,
    defaultWalletUserId: string,
    walletId: string | undefined = undefined;

  const enum TransactionSigns {
    expense = '-1',
    income = '1',
  }

  const formStore = getContext('form') as FormStore,
    isIncomeSignFieldName = 'sign';
  $: signChoices = [
    { value: TransactionSigns.expense, label: $_('cmps.transaction.common.expense') },
    { value: TransactionSigns.income, label: $_('cmps.transaction.common.income') },
  ];

  $: isIncome =
    $formStore.fields[isIncomeSignFieldName]?.inputValue === TransactionSigns.income || false;

  $: getCategoryChoices = (idList: string[]) =>
    idList
      .filter(id => {
        const category = $currentWalletCategoryStore[id];
        if (!category) return;
        if (walletId && category.walletId != walletId) return;

        return category.decr.isIncome === isIncome;
      })
      .map(id => ({ value: id, label: $currentWalletCategoryStore[id].decr.name }));

  $: popularCategoryChoices = {
    group: $_('cmps.transaction.form.category.popular'),
    choices: getCategoryChoices(
      transposeCountObjectToArray($autocompleteDataStore.categoryByPopularity)[noNestedObjectsKey],
    ).slice(0, 10),
  };

  $: allCategoryChoices = {
    group: $_('cmps.transaction.form.category.All'),
    choices: [
      { label: $_('cmps.category.common.noCategory'), value: null },
      ...getCategoryChoices($categorySortedByTitleStore.map(cat => cat.id)),
    ],
  };

  let categoryChoices: Choices = [];
  $: {
    const res = [] as Choices;
    if (suggestedCategoryIds?.length)
      res.push({
        group: $_('cmps.transaction.form.category.suggested'),
        choices: getCategoryChoices(suggestedCategoryIds).slice(0, 10),
      });
    else if (popularCategoryChoices.choices.length) res.push(popularCategoryChoices);

    res.push(allCategoryChoices);
    categoryChoices = res;
  }

  // Transpose store to select choices
  $: walletUserChoices = Object.values($currentWalletUserStore)
    .filter(ent => (walletId ? ent.walletId == walletId : true))
    .map(({ id, decr }) => ({
      value: id,
      label: decr.name,
    }));

  $: transactionSignField = {
    name: isIncomeSignFieldName,
    inputValue: ent
      ? ent.amount >= 0
        ? TransactionSigns.income
        : TransactionSigns.expense
      : undefined,
    choices: signChoices,
    clean: [ensureNumber],
  };

  $: amountField = {
    name: 'amount',
    inputValue: ent ? Math.abs(ent.amount) : undefined,
    clean: [ensureNumber],
    validate: [moreThan(0)],
    required: true,
  };

  $: walletUserField = {
    name: 'walletUserId',
    inputValue: ent?.walletUserId || defaultWalletUserId,
    label: $_('cmps.transaction.form.user'),
    choices: walletUserChoices,
    required: true,
    clean: [ensureString],
    validate: [oneOf(walletUserChoices.map(({ value }) => value))],
  };

  $: datetimeField = {
    name: 'datetime',
    inputValue: inputFormatDate(ent?.datetime || new Date()),
    label: $_('cmps.transaction.common.date'),
    required: true,
    clean: [ensureDate],
    validate: [dateIsAfter(new Date(0)), dateIsBefore(new Date())],
  };

  $: descriptionField = {
    name: 'description',
    inputValue: ent?.description,
    label: $_('cmps.transaction.form.description.label'),
    clean: [optionalString],
  };

  $: tagsField = {
    name: 'tags',
    inputValue: ent?.tags,
    label: $_('cmps.transaction.form.tags.label'),
    choices: [...$distinctTagNamesStore].map(t => ({ value: t, label: t })),
    clean: [ensureArray, uniqueOnly],
    validate: [maxArrLength(50)],
  };
</script>

<Field field={{ name: '', label: $_('cmps.transaction.common.amount'), required: true }}>
  <div class="field has-addons mb-0" slot="control">
    <FieldContext field={transactionSignField}>
      <p class="control">
        <SelectInput />
      </p>
    </FieldContext>
    <FieldContext field={amountField}>
      <p class="control">
        <TextInput type="number" placeholder="120 319.89" inputmode="decimal" />
      </p>
    </FieldContext>
  </div>

  <p class="help" slot="help">
    {#if ent?.originalAmount && ent.currency}
      <span class="has-text-weight-bold">{$_('cmps.transaction.form.originalAmount')}:</span>
      {$moneyFormat(ent.originalAmount, ent.currency)}
    {/if}
  </p>
</Field>
<div class="columns is-multiline is-mobile">
  {#if walletUserChoices.length > 1}
    <div class="column is-narrow narrow-column">
      <Field field={walletUserField}>
        <SelectInput />
      </Field>
    </div>
  {/if}
  <div class="column is-narrow narrow-column">
    <EmbeddedCategoryField {ent} {categoryChoices} isIncomeCategory={isIncome} />
  </div>
  <div class="column is-narrow">
    <Field field={datetimeField}>
      <TextInput type="date" />
    </Field>
  </div>
</div>

<div>
  <Field field={descriptionField}>
    <TextareaInput placeholder={$_('cmps.transaction.form.description.placeholder')} />
  </Field>

  <FieldContext field={tagsField}>
    <TagsField placeholder={$_('cmps.transaction.form.tags.placeholder')} allowCreate />
  </FieldContext>
</div>

<style lang="scss">
  /* This way we fight with ultra-lengthy category/owner names, and force the selects to fit on mobile in one row */
  .narrow-column {
    max-width: 50%;
  }
</style>
