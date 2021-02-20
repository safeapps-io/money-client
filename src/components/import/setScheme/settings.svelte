<script>
  import SettingsDropdown from '@/components/elements/dropdown/settings.svelte';
  import { Field, FieldContext, SelectInput, CheckboxInput } from '@/components/strict';

  import { _ } from 'svelte-i18n';
  import { setContext } from 'svelte';
  import { noop } from 'svelte/internal';

  import { ensureBoolean } from '@/core/strict/boolean';
  import { createFormStore } from '@/components/strict/base';
  import { decimalDelimitersChoices, encodings } from '@/core/import/constants';

  export let encoding: string,
    decimal: string,
    header = true;

  const formStore = createFormStore();
  setContext('form', formStore);

  $: encodingField = {
    name: 'encoding',
    label: $_('cmps.csv.scheme.settings.encoding'),
    inputValue: encoding,
    choices: encodings,
  };
  $: headerField = {
    name: 'header',
    label: $_('cmps.csv.scheme.settings.hasHeader').toLowerCase(),
    inputValue: header,
    clean: [ensureBoolean],
  };
  $: decimalDelimiterField = {
    name: 'decimal',
    label: $_('cmps.csv.scheme.settings.decimal'),
    inputValue: decimal,
    choices: decimalDelimitersChoices,
  };

  $: encoding = $formStore.fields.encoding?.inputValue ?? encoding;
  $: header = $formStore.fields.header?.inputValue ?? header;
  $: decimal = $formStore.fields.decimal?.inputValue ?? decimal;
</script>

<SettingsDropdown>
  <form on:submit|preventDefault={noop} novalidate>
    <div class="control mb-3">
      <Field field={encodingField}>
        <SelectInput customClass="is-small" />
      </Field>
    </div>
    <div class="control mb-3">
      <Field field={decimalDelimiterField}>
        <SelectInput customClass="is-small" />
      </Field>
    </div>
    <div class="control is-size-7">
      <FieldContext field={headerField}>
        <CheckboxInput />
      </FieldContext>
    </div>
  </form>
</SettingsDropdown>
