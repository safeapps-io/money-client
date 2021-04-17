<script>
  import { createEventDispatcher, getContext, setContext } from 'svelte';
  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { FormError } from '$services/errors';
  import { createFormStore, setCleanedValue, runValidation } from '$strict/base';

  const dispatch = createEventDispatcher();

  export let buttonText: string = '',
    showSubmit: boolean = true,
    success: ((data: any) => Promise<any>) | undefined = undefined,
    formDisabled = false as boolean,
    cleanup: undefined | boolean = undefined,
    notificationText: undefined | string = undefined;

  export let formStore = createFormStore();
  setContext('form', formStore);

  const successNotif = getContext('success');

  $: ({ formDisabled } = $formStore);

  /**
   * It would launch data validation.
   * If success callback is provided it would call it; otherwise it would dispatch the data.
   *
   * It should be a `export const`, but I stumbled upon a very pesky bug:
   * https://github.com/sveltejs/svelte/issues/5589
   * So if a form is inside a slot, we can have an invalid ref to the component, so for now
   * we just use it as a `let`.
   */
  export let submit = async () => {
    // Saving ourselves from multiple submissions
    if ($formStore.loading) return;

    $formStore.error = null;
    $formStore.loading = true;

    Object.values($formStore.fields)
      .filter(field => !field.isBlurred)
      .forEach(field => {
        // Setting isBlurred to true so the errors display correctly
        $formStore.fields[field.name].isBlurred = true;
        setCleanedValue(formStore, field);
        runValidation(formStore, field);
      });

    const { isValid, data } = Object.values($formStore.fields).reduce(
      (acc, curr) => {
        acc.isValid = acc.isValid && (curr.isValid || false);
        acc.data[curr.name] = curr.value;
        return acc;
      },
      { isValid: true, data: {} as { [fieldname: string]: any } },
    );
    if (isValid) {
      if (!success) {
        $formStore.loading = false;
        return dispatch('success', data);
      }

      try {
        await success(data);

        if (notificationText) successNotif(notificationText);
        if (cleanup) {
          /**
           * If user still focuses on an input element (say, enter was pressed), we blur it before
           * resetting field's value, so if user leaves the field, no errors pop out
           */
          (document.activeElement as any)?.blur();

          Object.keys($formStore.fields).forEach(
            key => ($formStore.fields[key].inputValue = undefined),
          );
        }
      } catch (e) {
        if (e instanceof FormError) {
          if (e.errors.fieldErrors)
            Object.entries(e.errors.fieldErrors).forEach(
              ([fieldname, fieldErrors]) =>
                ($formStore.fields[fieldname].errors = fieldErrors.map(code =>
                  e.remote ? $_(`common.errors.cmp.${code}`) : code,
                )),
            );
          else
            $formStore.error = e.errors.message
              ? $_(`common.errors.cmp.${e.errors.message}`)
              : null;
        } else {
          console.error(e);
          $formStore.error = $_('common.errors.unknown');
        }
      }
    }
    $formStore.loading = false;
  };

  $: $formStore.submitDisabled =
    !!$formStore.error ||
    Object.values($formStore.fields).filter(field => field.isBlurred && !field.isValid).length !==
      0;
</script>

<svelte:options accessors />

<form on:submit|preventDefault={submit} novalidate>
  <slot />
  {#if showSubmit}
    <slot
      name="submit"
      {buttonText}
      disabled={$formStore.submitDisabled || $formStore.formDisabled}
      loading={$formStore.loading}>
      <div class="field">
        <div class="control">
          <button
            class="button is-outlined"
            class:is-color-loading={$formStore.loading}
            disabled={$formStore.submitDisabled || $formStore.formDisabled}>
            {buttonText}
          </button>
        </div>
      </div>
    </slot>
    {#if $formStore.error}
      <p class="help is-danger" transition:slide|local>{$formStore.error}</p>
    {/if}
  {/if}
</form>
