<script lang="typescript">
  import type { FormStore, FieldState, RequiredFieldState } from '$strict/base';

  import { getContext, setContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { setCleanedValue, runValidation } from '$strict/base';

  export let field: RequiredFieldState;

  const formStore = getContext('form') as FormStore,
    id = Math.random().toString(),
    runChecks = () => {
      setCleanedValue(formStore, fieldState);
      runValidation(formStore, fieldState);
    };

  $: if (!$formStore.fields[field.name]) {
    $formStore.fields[field.name] = {
      errors: [],
      clean: [],
      validate: [],
      id,
      ...field,
    } as FieldState;
  }

  setContext('runChecks', runChecks);
  setContext('fieldname', field.name);
  $: fieldState = $formStore.fields[field.name];
  $: errorText =
    fieldState.isBlurred && fieldState.errors.length
      ? fieldState.errors
          .map(err => (typeof err == 'string' ? $_(err) : $_(err.key, { values: err.values })))
          .join('. ')
      : null;
  $: disabled = $formStore.formDisabled || $formStore.submitDisabled;
  $: formLoading = $formStore.loading;
</script>

<div class="field">
  {#if !fieldState.hideLabel && fieldState.label}
    <label class="label" for={id}>
      {fieldState.label}
      {#if fieldState.required}<span class="has-text-danger">*</span>{/if}
    </label>
  {/if}
  <slot name="control">
    <div class="control" class:is-loading={fieldState.loading}>
      <slot {disabled} {formLoading} />
    </div>
  </slot>
  <slot name="help" {errorText}>
    {#if errorText}
      <p class="help is-danger" transition:slide|local>
        {@html errorText}
      </p>
    {:else if fieldState.help}
      <p class="help" transition:slide|local>
        {@html fieldState.help}
      </p>
    {/if}
  </slot>
</div>
