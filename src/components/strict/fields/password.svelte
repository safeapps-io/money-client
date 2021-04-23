<script>
  import Field from '$components/strict/field.svelte';
  import TextInput from '$components/strict/inputs/text.svelte';

  import { ensureString, trim, minLength, maxLength } from '$validators';

  export let name: string = 'password',
    help: string | undefined = undefined,
    label: string | undefined = undefined;

  $: field = {
    label,
    name,
    required: true,
    help,
    clean: [ensureString, trim],
    validate: [minLength(6), maxLength(100)],
  };
</script>

<Field {field}>
  <TextInput type="password" placeholder="correct-horse-staple-battery" />
</Field>
