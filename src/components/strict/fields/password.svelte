<script>
  import Field from '@/components/strict/field.svelte';
  import Text from '@/components/strict/inputs/text.svelte';

  import { ensureString, trim, minLength, maxLength } from '@/core/strict/string';

  export let name: string = 'password',
    help: string | undefined = undefined,
    label: string | undefined = undefined;

  const field = {
    label,
    name,
    required: true,
    help,
    clean: [ensureString, trim],
    validate: [minLength(6), maxLength(100)],
  };
</script>

<Field {field}>
  <Text type="password" placeholder="correct-horse-staple-battery" />
</Field>
