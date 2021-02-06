<script>
  import type { MetaCategory } from '@/stores/metaCategory';

  import { NameField, ColorField, Field, CheckboxInput, TextareaInput } from '@/components/strict';

  import { ensureJson } from '@/core/strict/object';
  import { ensureBoolean } from '@/core/strict/boolean';

  export let ent: MetaCategory | undefined = undefined;

  $: publishedField = {
    name: 'published',
    inputValue: ent ? ent.published : true,
    clean: [ensureBoolean],
    label: 'Is published?',
  };
  $: assignedMccField = {
    name: 'assignedMcc',
    label: 'Assigned MCC',
    inputValue: JSON.stringify(ent?.assignedMcc, null, 2) || '',
    clean: [ensureJson],
    help: '{ code: string; weight: number }[]',
  };
</script>

<NameField inputValue={ent?.name} />

<Field field={publishedField}>
  <CheckboxInput />
</Field>

<ColorField inputValue={ent?.color} />
<Field
  field={{
    name: 'isIncome',
    label: 'Is income category?',
    clean: [ensureBoolean],
    inputValue: ent?.isIncome,
  }}>
  <CheckboxInput />
</Field>
<Field field={assignedMccField}>
  <TextareaInput rows={5} />
</Field>
