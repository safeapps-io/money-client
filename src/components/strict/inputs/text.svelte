<script lang="typescript">
  import type { FormStore } from '$components/strict/base';

  import { getContext } from 'svelte';

  import { autofocus as autofocusAction } from '$utils/actions/autofocus';

  export let type: string | undefined = 'text',
    autocomplete: string | undefined = 'off',
    autocapitalize: string | undefined = 'off',
    autocorrect: 'on' | 'off' | undefined = 'off',
    readonly: boolean = false,
    placeholder: string | undefined = '',
    inputmode: string | undefined = 'text',
    autofocus = false;

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void;

  $: field = $formStore.fields[fieldname];

  const onInput: svelte.JSX.EventHandler<Event, HTMLInputElement> = e => {
      $formStore.fields[fieldname].isBlurred = false;
      $formStore.fields[fieldname].inputValue = e.currentTarget.value;

      runChecks();
    },
    onBlur = () => {
      $formStore.fields[fieldname].isBlurred = true;
      runChecks();
    };
</script>

<input
  class="input"
  class:is-danger={field.isBlurred && !field.isValid}
  {type}
  {autocomplete}
  {autocorrect}
  {autocapitalize}
  {readonly}
  {placeholder}
  {inputmode}
  id={field.id}
  value={field.inputValue || ''}
  disabled={field.disabled || $formStore.formDisabled}
  aria-label={field.label}
  use:autofocusAction={autofocus}
  on:input={onInput}
  on:blur={onBlur}
/>
