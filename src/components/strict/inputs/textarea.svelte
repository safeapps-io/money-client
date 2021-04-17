<script lang="typescript">
  import type { FormStore } from '$strict/base';

  import { getContext } from 'svelte';

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void;

  export let readonly: boolean = false,
    placeholder: string | undefined = '',
    rows = 2;

  $: field = $formStore.fields[fieldname];

  const onInput: svelte.JSX.EventHandler<Event, HTMLTextAreaElement> = e => {
      $formStore.fields[fieldname].isBlurred = false;
      $formStore.fields[fieldname].inputValue = e.currentTarget.value;

      runChecks();
    },
    onBlur = () => {
      $formStore.fields[fieldname].isBlurred = true;
      runChecks();
    };
</script>

<textarea
  class="textarea"
  class:is-danger={field.isBlurred && !field.isValid}
  {rows}
  {placeholder}
  {readonly}
  id={field.id}
  value={field.inputValue || ''}
  disabled={field.disabled || $formStore.formDisabled}
  on:input={onInput}
  on:blur={onBlur} />
