<script>
  import type { FormStore } from '@/components/strict/base';

  import { getContext } from 'svelte';
  import { slide } from 'svelte/transition';

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void;

  export let placeholder: string;

  $: field = $formStore.fields[fieldname]!;

  const onInput: svelte.JSX.EventHandler<Event, HTMLInputElement> = e => {
    $formStore.fields[fieldname]!.isBlurred = false;
    $formStore.fields[fieldname]!.inputValue = e.currentTarget.files;

    runChecks();
  };
</script>

<div class="file is-boxed" class:has-name={field.inputValue}>
  <label class="file-label">
    <input class="file-input" type="file" on:change={onInput} />
    <span class="file-cta"> <span class="file-label">{placeholder}</span> </span>
    {#if field.inputValue}
      <span class="file-name" in:slide>
        {#if field.inputValue.length === 1}
          {field.inputValue[0].name}
        {:else}{field.inputValue.length} файлов{/if}
      </span>
    {/if}
  </label>
</div>
