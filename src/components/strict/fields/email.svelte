<script>
  import Field from '@/components/strict/field.svelte';
  import Text from '@/components/strict/inputs/text.svelte';

  import { optionalString, ensureString, trim, emailFormat } from '@/core/strict/string';

  export let required: boolean,
    help: string | undefined = undefined;

  $: field = {
    label: 'Email',
    name: 'email',
    required,
    help,
    clean: [required ? ensureString : optionalString, trim],
    validate: [emailFormat],
  };
</script>

<Field {field}>
  <Text type="email" autocomplete="email" />
</Field>
