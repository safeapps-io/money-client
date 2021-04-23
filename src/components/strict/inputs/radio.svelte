<script lang="typescript">
  import type { FormStore, LabeledChoice } from '$strict/base';

  import { getContext } from 'svelte';

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void,
    onChange = (value: string) => {
      $formStore.fields[fieldname].isBlurred = true;
      $formStore.fields[fieldname].inputValue = value;

      runChecks();
    };

  let group: string = $formStore.fields[fieldname].inputValue,
    choices: LabeledChoice[] = ($formStore.fields[fieldname]
      .choices! as unknown) as LabeledChoice[];
  $: field = $formStore.fields[fieldname];

  /**
   * We don't want to call onChange the moment component mounts, only when user changes something.
   * Seems to be the simplest way to do this.
   */
  let firstRun = true;
  $: firstRun ? (firstRun = false) : onChange(group);
</script>

{#each choices as choice}
  <div class="control">
    <label class="radio" class:is-disabled={field.disabled || $formStore.formDisabled}>
      {choice.label}
      <input
        type="radio"
        value={choice.value}
        bind:group
        disabled={field.disabled || $formStore.formDisabled} />
      <span class="check" />
    </label>
  </div>
{/each}

<slot value={field.value} />
