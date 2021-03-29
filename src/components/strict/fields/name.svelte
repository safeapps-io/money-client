<script>
  import { _ } from 'svelte-i18n';

  import Field from '$components/strict/field.svelte';
  import TextInput from '$components/strict/inputs/text.svelte';

  import { ensureString, trim, minLength } from '$core/strict/string';

  export let placeholder = undefined as string | undefined,
    inputValue: string | undefined;

  const field = {
    name: 'name',
    label: $_('common.form.name'),
    inputValue,
    required: true,
    clean: [ensureString, trim],
    validate: [minLength()],
  };
</script>

<Field {field}>
  <TextInput {placeholder} />
</Field>
