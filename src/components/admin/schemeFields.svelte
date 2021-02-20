<script>
  import type { SimpleScheme } from '@/core/import/types';

  import { Field, TextInput, CheckboxInput, TextareaInput, SelectInput } from '@/components/strict';

  import { ensureString, minLength, optionalString, trim } from '@/core/strict/string';
  import { ensureJson } from '@/core/strict/object';
  import { ensureBoolean } from '@/core/strict/boolean';
  import { decimalDelimitersChoices, encodings } from '@/core/import/constants';

  export let ent: SimpleScheme | undefined = undefined;

  $: titleField = {
    name: 'title',
    label: 'Title',
    inputValue: ent?.title,
    required: true,
    clean: [ensureString, trim],
    validate: [minLength()],
  };

  $: publishedField = {
    name: 'published',
    inputValue: ent ? ent.published : true,
    label: 'Is published?',
    clean: [ensureBoolean],
  };
  $: headerField = { name: 'header', inputValue: ent ? ent.header : true, label: 'Has header' };

  $: transformDateFormatField = {
    name: 'transformDateFormat',
    label: 'Date transform format',
    inputValue: ent?.transformDateFormat,
    required: true,
    clean: [ensureString, trim],
    validate: [minLength()],
  };

  $: encodingField = {
    name: 'encoding',
    label: 'Encoding',
    inputValue: ent?.encoding,
    choices: encodings,
  };
  $: decimalDelimiterField = {
    name: 'decimalDelimiterChar',
    label: 'Decimal delimiter',
    inputValue: ent?.decimalDelimiterChar,
    choices: decimalDelimitersChoices,
  };

  const optionalStringParams = {
    clean: [ensureString, optionalString, trim],
    validate: [minLength()],
  };
  $: delimiterField = {
    name: 'delimiter',
    inputValue: ent?.delimiter,
    label: 'Delimiter',
    ...optionalStringParams,
  };
  $: newlineField = {
    name: 'newline',
    inputValue: ent?.newline,
    label: 'Newline',
    ...optionalStringParams,
  };
  $: quoteCharField = {
    name: 'quoteChar',
    inputValue: ent?.quoteChar,
    label: 'Quote char',
    ...optionalStringParams,
  };
  $: escapeCharField = {
    name: 'escapeChar',
    inputValue: ent?.escapeChar,
    label: 'Escape char',
    ...optionalStringParams,
  };

  const possibleValues = ['"amount"', '"datetime"', '"originalAmount"', '"currency"', 'null'];
  $: fieldnameMapField = {
    name: 'fieldnameMap',
    label: 'Fieldname Map',
    inputValue: JSON.stringify(ent?.fieldnameMap, null, 2),
    clean: [ensureJson],
    help: `Array&lt;${possibleValues.join(' | ')}&gt;`,
  };
</script>

<Field field={titleField}>
  <TextInput />
</Field>

<Field field={publishedField}>
  <CheckboxInput />
</Field>
<Field field={headerField}>
  <CheckboxInput />
</Field>

<Field field={encodingField}>
  <SelectInput />
</Field>
<Field field={decimalDelimiterField}>
  <SelectInput />
</Field>

<Field field={transformDateFormatField}>
  <TextInput />
</Field>

<Field field={fieldnameMapField}>
  <TextareaInput rows={5} />
</Field>

<Field field={delimiterField}>
  <TextInput />
</Field>
<Field field={newlineField}>
  <TextInput />
</Field>
<Field field={quoteCharField}>
  <TextInput />
</Field>
<Field field={escapeCharField}>
  <TextInput />
</Field>
