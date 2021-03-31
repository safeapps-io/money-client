<script>
  import { getContext, setContext } from 'svelte';

  import type { FormStore, FieldState, RequiredFieldState } from '$components/strict/base';
  import { setCleanedValue, runValidation } from '$components/strict/base';

  export let field: RequiredFieldState;

  const formStore = getContext('form') as FormStore,
    id = Math.random().toString(),
    runChecks = () => {
      setCleanedValue(formStore, fieldState);
      runValidation(formStore, fieldState);
    };

  $: $formStore.fields[field.name] = {
    errors: [],
    clean: [],
    validate: [],
    id,
    ...field,
  } as FieldState;

  setContext('runChecks', runChecks);
  setContext('fieldname', field.name);
  $: fieldState = $formStore.fields[field.name];
</script>

<slot />
