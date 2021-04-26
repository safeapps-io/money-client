<script>
  import Field from '$components/strict/field.svelte';
  import TextInput from '$components/strict/inputs/text.svelte';

  import { optionalString, ensureString, trim, emailFormat } from '$validators';

  export let required: boolean = false,
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
  <TextInput type="email" autocomplete="email" />
</Field>
