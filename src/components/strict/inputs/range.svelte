<script lang="typescript">
  import type { FormStore } from '@/components/strict/base';

  import { getContext } from 'svelte';

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void;

  export let min: number,
    max: number,
    step: number,
    readonly: boolean = false,
    placeholder: string | undefined = '';

  $: field = $formStore.fields[fieldname];

  const onInput: svelte.JSX.EventHandler<Event, HTMLInputElement> = e => {
      $formStore.fields[fieldname].isBlurred = false;
      $formStore.fields[fieldname].inputValue = parseFloat(e.currentTarget.value);

      runChecks();
    },
    onBlur = () => {
      $formStore.fields[fieldname].isBlurred = true;
      runChecks();
    };
</script>

<input
  class="range"
  class:is-danger={field.isBlurred && !field.isValid}
  type="range"
  {min}
  {max}
  {step}
  {placeholder}
  {readonly}
  id={field.id}
  value={field.inputValue}
  disabled={field.disabled || $formStore.formDisabled}
  aria-label={field.label}
  on:input={onInput}
  on:blur={onBlur} />
