<script>
  import Field from '$components/strict//field.svelte';
  import TextInput from '$components/strict//inputs/text.svelte';

  import { _ } from 'svelte-i18n';

  import { randBetween } from '$utils/random';
  import { ensureString, maxLength, minLength, numberFormat, trim } from '$validators';

  const getPlaceholder = () => {
    let res = randBetween(0, 999999).toFixed(0);
    while (res.length < 6) res = '0' + res;
    return res;
  };

  export let showHelp = true,
    autofocus = false;

  $: field = {
    name: 'pinCode',
    clean: [ensureString, trim],
    validate: [numberFormat, minLength(6), maxLength(6)],
    label: $_('cmps.masterPassword.old.pin.label'),
    help: showHelp ? $_('cmps.masterPassword.old.pin.help') : undefined,
  };
</script>

<Field {field}>
  <div class="field">
    <TextInput {autofocus} type="number" inputmode="decimal" placeholder={getPlaceholder()} />
  </div>
</Field>

<style>
  .field :global(input) {
    -webkit-text-security: disc;
  }
</style>
