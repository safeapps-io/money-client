<script lang="typescript">
  import type { FormStore } from '@/components/strict/base';

  import { getContext } from 'svelte';

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void;

  $: field = $formStore.fields[fieldname];
  $: disabled = field.disabled || $formStore.formDisabled;
  $formStore.fields[fieldname].hideLabel = true;

  const onChange: svelte.JSX.EventHandler<Event, HTMLInputElement> = e => {
    $formStore.fields[fieldname].isBlurred = true;
    $formStore.fields[fieldname].inputValue = e.currentTarget.checked;

    runChecks();
  };
</script>

<label class="checkbox" class:is-disabled={disabled}>
  {@html field.label || ''}
  <input type="checkbox" on:change={onChange} checked={field.inputValue} {disabled} />
  <span class="check" />
</label>
