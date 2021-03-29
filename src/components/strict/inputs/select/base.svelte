<script>
  import type { FormStore } from '$components/strict/base';

  import ChoiceCmp from './choice.svelte';

  import { getContext } from 'svelte';

  import { oneOf } from '$core/strict/string';
  import { getValueFromChoisesRecursively } from '$components/strict/base';

  import { debugLog } from '$core/logger';

  export let customClass: string | undefined = undefined;

  const fieldname = getContext('fieldname') as string,
    formStore = getContext('form') as FormStore,
    runChecks = getContext('runChecks') as () => void;

  $: field = $formStore.fields[fieldname];
  $: baseChoices = field.choices!;

  // Setting first value, if no value came
  let initialUndefinedValueSet = false;

  const setInputValue = (val: string | null) => ($formStore.fields[fieldname].inputValue = val);
  /**
   * We treat `null` as a valid value for `field.inputValue` — it may be, for example, the lack of
   * category (no category). So we don't want to set anything in this case here.
   * `undefined` would be transformed to the first choice if it is present.
   */
  $: if (
    !initialUndefinedValueSet &&
    typeof field.inputValue == 'undefined' &&
    baseChoices.length
  ) {
    initialUndefinedValueSet = true;
    const initialValue = getValueFromChoisesRecursively(baseChoices[0]);

    debugLog('[select] no value provided, setting the first option', {
      name: field.name,
      initialValue,
    });

    setInputValue(initialValue);
  }

  const blur = () => {
    const f = $formStore.fields[fieldname];
    f.isBlurred = true;
  };

  // We don't use on:change to track values, because two-way binding allows you to
  // put JS values in <option> and get them in return. Very handy!
  let selectValue: any,
    needToInitializeValue = true;
  $: if (needToInitializeValue) {
    debugLog('[select] setting initial value', {
      name: field.name,
      value: field.inputValue,
    });

    selectValue = field.inputValue;
    needToInitializeValue = false;
  }

  $: oneOfCheck = oneOf(baseChoices.map(choice => getValueFromChoisesRecursively(choice)));

  // `runChecks()` changes `formStore`, so that this block runs in an infinite loop.
  // So we introduce our own change tracking system, lol.
  let changeToken = 0,
    prevChangeToken = changeToken;
  const change = () => (changeToken = Math.random());
  $: if (changeToken != prevChangeToken) {
    blur();

    const f = $formStore.fields[fieldname];
    f.inputValue = selectValue;
    runChecks();

    const checkResult = oneOfCheck(f.inputValue);
    if (checkResult) f.errors.push(checkResult);

    prevChangeToken = changeToken;
  }

  export const changeValue = (newVal: string) => {
    selectValue = newVal;
    change();
  };
</script>

<div
  class={`select ${customClass || ''}`}
  class:is-loading={field.loading}
  class:is-danger={field.isBlurred && !field.isValid}>
  <select
    disabled={field.disabled || $formStore.formDisabled}
    id={field.id}
    bind:value={selectValue}
    on:blur={change}
    on:change={change}>
    <ChoiceCmp choices={baseChoices} />
  </select>
</div>
