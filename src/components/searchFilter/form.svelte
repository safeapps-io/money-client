<script>
  import type { SearchFilter, FullEntity, OmitCommonFields } from '$stores/decr/types';
  import type { FormStore } from '$strict/base';

  import { Form, FieldContext, NameField, TagsField } from '$strict';
  import Level from '$components/elements/level.svelte';
  import DeleteEntityButton from '$components/elements/deleteEntityButton.svelte';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { areArraysTheSame } from '$utils/array';
  import { copy } from '$utils/object';

  import { ensureArray, uniqueOnly } from '$validators';
  import { selectedWalletStore } from '$stores/wallet';
  import { distinctTagNamesStore } from '$stores/decr/transaction';
  import { categorySortedByTitleStore } from '$stores/decr/category';
  import { searchFilterAdd, searchFilterUpdate } from '$stores/decr/searchFilter';

  export let searchFilter: FullEntity<SearchFilter>;

  const dispatch = createEventDispatcher(),
    { name, protected: isProtected } = searchFilter.decr;

  $: categoryChoices = $categorySortedByTitleStore.map(cat => ({
    value: cat.id,
    label: cat.decr.name,
  }));
  $: tagChoices = [...$distinctTagNamesStore].map(tag => ({ value: tag }));
  const clean = [ensureArray, uniqueOnly],
    categoryFields = { oneOf: 'c.oneOf', noneOf: 'c.noneOf' },
    tagFields = { oneOf: 't.oneOf', noneOf: 't.noneOf' };

  /**
   * Intentionally losing the reactivity to avoid value resetting after some change happens.
   * We mutate the value, so it goes up in binding, but we don't want it to be resetted.
   */
  let cOneOf = searchFilter.decr.parameters.category.oneOf;
  $: categoryOneOf = {
    name: categoryFields.oneOf,
    label: $_('cmps.searchFilter.form.wCat'),
    choices: categoryChoices,
    inputValue: cOneOf,
    clean,
  };
  let cNoneOf = searchFilter.decr.parameters.category.noneOf;
  $: categoryNoneOf = {
    name: categoryFields.noneOf,
    label: $_('cmps.searchFilter.form.nwCat'),
    choices: categoryChoices,
    inputValue: cNoneOf,
    clean,
  };
  let tOneOf = searchFilter.decr.parameters.tag.oneOf;
  $: tagOneOf = {
    name: tagFields.oneOf,
    label: $_('cmps.searchFilter.form.wTag'),
    choices: tagChoices,
    inputValue: tOneOf,
    clean,
  };
  let tNoneOf = searchFilter.decr.parameters.tag.noneOf;
  $: tagNoneOf = {
    name: tagFields.noneOf,
    label: $_('cmps.searchFilter.form.nwTag'),
    choices: tagChoices,
    inputValue: tNoneOf,
    clean,
  };

  let saveAsNew = false;

  const success = async (
    data: {
      name: string;
      'c.oneOf': string[];
      'c.noneOf': string[];
      't.oneOf': string[];
      't.noneOf': string[];
    } & any,
  ) => {
    const newEnt: OmitCommonFields<SearchFilter> = {
      name: data.name,
      group: searchFilter.decr.group,
      parameters: {
        category: { oneOf: data[categoryFields.oneOf], noneOf: data[categoryFields.noneOf] },
        tag: { oneOf: data[tagFields.oneOf], noneOf: data[tagFields.noneOf] },
      },
    };

    // If saving as new we don't want to mutate the original object, so we copy its value
    const savedEnt = await (saveAsNew
      ? searchFilterAdd(searchFilter.walletId, copy(newEnt))
      : searchFilterUpdate({ ent: searchFilter, decr: { ...searchFilter.decr, ...newEnt } }));

    dispatch('submit', savedEnt);
  };

  let formStore: FormStore | undefined;
  $: {
    // Reactively updating the passed prop to match the form data
    // No update if user has clicked on cancel or if only the name changed
    if (formStore) {
      const fields = $formStore.fields,
        { category, tag } = searchFilter.decr.parameters;

      // Comparing the values and setting a copy of them if they differ somehow
      if (!areArraysTheSame(category.oneOf, fields[categoryFields.oneOf].inputValue))
        searchFilter.decr.parameters.category.oneOf = [...fields[categoryFields.oneOf].inputValue];
      if (!areArraysTheSame(category.noneOf, fields[categoryFields.noneOf].inputValue))
        searchFilter.decr.parameters.category.noneOf = [
          ...fields[categoryFields.noneOf].inputValue,
        ];
      if (!areArraysTheSame(tag.oneOf, fields[tagFields.oneOf].inputValue))
        searchFilter.decr.parameters.tag.oneOf = [...fields[tagFields.oneOf].inputValue];
      if (!areArraysTheSame(tag.noneOf, fields[tagFields.noneOf].inputValue))
        searchFilter.decr.parameters.tag.noneOf = [...fields[tagFields.noneOf].inputValue];
    }
  }
</script>

<Form planLimit {success} bind:formStore>
  {#if $selectedWalletStore}
    <NameField inputValue={name} />
  {/if}

  <FieldContext field={categoryOneOf}>
    <TagsField />
  </FieldContext>

  <FieldContext field={categoryNoneOf}>
    <TagsField />
  </FieldContext>

  <FieldContext field={tagOneOf}>
    <TagsField />
  </FieldContext>

  <FieldContext field={tagNoneOf}>
    <TagsField />
  </FieldContext>

  <Level slot="submit" let:disabled let:loading>
    <div class="column is-narrow" slot="left">
      {#if $selectedWalletStore}
        {#if !isProtected}
          <button class="button" class:is-color-loading={loading} {disabled}
            >{$_('common.form.save')}</button>
        {/if}

        <button
          class="button is-success is-outlined"
          class:is-color-loading={loading}
          {disabled}
          on:click={() => (saveAsNew = true)}>
          {$_('cmps.searchFilter.form.saveAsNew')}
        </button>
      {/if}
    </div>

    <div class="column is-narrow" slot="right">
      {#if !isProtected}
        <DeleteEntityButton entityMap={{ [searchFilter.walletId]: [searchFilter.id] }} on:delete />
      {/if}
      <button
        class="button"
        class:is-color-loading={loading}
        type="button"
        on:click={() => dispatch('reset')}>
        {$_('common.form.cancel')}
      </button>
    </div>
  </Level>
</Form>
