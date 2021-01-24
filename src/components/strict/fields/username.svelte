<script>
  import Field from '@/components/strict/field.svelte';
  import Text from '@/components/strict/inputs/text.svelte';

  import { _ } from 'svelte-i18n';
  import { ensureString, trim, minLength, maxLength } from '@/core/strict/string';

  $: field = {
    name: 'username',
    label: $_('cmps.user.username.label'),
    placeholder: 'whitfield.hellman',
    clean: [ensureString, trim],
    validate: [minLength(4), maxLength(50)],
    required: true,
  };
</script>

<Field {field}>
  <Text autocomplete="username" />
</Field>
