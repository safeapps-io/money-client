<script>
  import Field from '$components/strict/field.svelte';
  import TextInput from '$components/strict/inputs/text.svelte';

  import { _ } from 'svelte-i18n';
  import { ensureString, trim, minLength, maxLength } from '$validators';

  $: field = {
    name: 'username',
    label: $_('cmps.user.username.label'),
    clean: [ensureString, trim],
    validate: [minLength(4), maxLength(50)],
    required: true,
  };
</script>

<Field {field}>
  <TextInput autocomplete="username" placeholder="whitfield.hellman" />
</Field>
