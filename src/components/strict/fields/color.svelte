<script>
  import Field from '$components/strict/field.svelte';
  import TextInput from '$components/strict/inputs/text.svelte';

  import { _ } from 'svelte-i18n';

  import { generateRandomColor } from '$utils/color';
  import { ensureString, trim, hexColorFormat } from '$core/strict/string';

  export let inputValue: string | undefined = undefined;

  let realInput: string = inputValue || generateRandomColor();

  $: field = {
    name: 'color',
    label: $_('common.form.color.name'),
    inputValue: realInput,
    clean: [ensureString, trim],
    validate: [hexColorFormat],
  };
</script>

<Field {field}>
  <TextInput type="color" />
  <p class="help" slot="help">
    <button
      type="button"
      class="button is-small is-text"
      on:click={() => (realInput = generateRandomColor())}>
      {$_('common.form.color.random')}
      👩🏽‍🎨
    </button>
  </p>
</Field>
