<script>
  import type { FormStore, LabeledChoice } from '$strict/base';

  import { getContext, tick } from 'svelte';
  import { slide } from 'svelte/transition';

  import { clickOutside } from '$utils/actions/clickOutside';

  import TagChoices from './tagChoices.svelte';
  import TagInput from './tagInput.svelte';

  export let placeholder: string | undefined = undefined,
    allowCreate = false;

  const fieldname = getContext('fieldname') as string,
    runChecks = getContext('runChecks') as () => void,
    formStore = getContext('form') as FormStore;

  let inputValue: string = '',
    showChoices: boolean = false;

  $: field = $formStore.fields[fieldname];

  $: choices = field.choices
    ? (field.choices as LabeledChoice[])
        // Items that user has already chosen
        .filter(item => !field.value || !field.value.includes(item.value))
        // We search by user's input
        .filter(
          ({ label, value }) =>
            !inputValue ||
            (label || value)!.toLowerCase().includes(inputValue.toLowerCase().trim()),
        )
    : null;

  // We need to print out the label rather than the real value
  $: fieldDisplayValue = (field.inputValue || []).map((value: string) => {
    if (field.choices) {
      const theChosenOne = (field.choices as LabeledChoice[]).find(
        choice => choice.value === value,
      );
      if (theChosenOne && theChosenOne.label) return { label: theChosenOne.label, value };
    }
    return { value, label: value };
  });

  let hoveredItemIndex: null | number = null;

  /**
   * Creatable:
   * User can create new items.
   * If user has no items hovered, clicking on enter means "create a new item!".
   * If an item is hovered, enter should pick this item.
   *
   * Not creatable:
   * User must choose from the dropdown list. We hover some item on every change of input value.
   * When user clicks on enter, we accept the hovered item.
   */
  $: if (!allowCreate && inputValue) hoveredItemIndex = choices?.length ? 0 : null;

  /**
   * When you click on any item, the input gets blurred and the choices box is instantly hidden.
   *
   * We don't want this, so we set a timeout. If user clicked on a choice, the click handler would
   * clear the timeout. If user legitimately blurred the input, it would dissappear 150ms after.
   */
  let blurTimer: number | undefined,
    enableScroll = false;
  const blur = () => (blurTimer = window.setTimeout(() => (showChoices = false), 150)),
    click = ({ detail: index }: CustomEvent<number>) => {
      clearTimeout(blurTimer);
      addTag(choices![index].value);
      hoveredItemIndex = null;
      inputValue = '';
    },
    upArrow = async () => {
      enableScroll = true;
      if (hoveredItemIndex === null || hoveredItemIndex === 0)
        hoveredItemIndex = choices!.length - 1;
      else hoveredItemIndex--;

      await tick();
      enableScroll = false;
    },
    downArrow = async () => {
      enableScroll = true;
      if (hoveredItemIndex === null || choices!.length - 1 === hoveredItemIndex)
        hoveredItemIndex = 0;
      else hoveredItemIndex++;

      await tick();
      enableScroll = false;
    },
    enter = () => {
      if (!allowCreate && hoveredItemIndex === null) return (inputValue = '');

      if (hoveredItemIndex !== null) {
        addTag(choices![hoveredItemIndex].value);
        hoveredItemIndex = null;
      } else {
        const trimmed = inputValue.trim();
        if (trimmed.length && trimmed.length <= 100) addTag(trimmed);
      }
      inputValue = '';
    };

  $: addTag = (tag: string) => {
    const curr = $formStore.fields[fieldname].inputValue || [];
    $formStore.fields[fieldname].isBlurred = true;
    $formStore.fields[fieldname].inputValue = [...curr, tag];

    runChecks();

    // Syncing validated data to input value
    $formStore.fields[fieldname].inputValue = $formStore.fields[fieldname].value;
  };

  $: removeTag = (i?: number) => {
    const inputValue = $formStore.fields[fieldname].inputValue as string[];
    if (!inputValue || !inputValue.length) return;

    inputValue.splice(i || inputValue.length - 1, 1);
    $formStore.fields[fieldname].inputValue = [...inputValue];

    runChecks();

    // Syncing validated data to input value
    $formStore.fields[fieldname].inputValue = $formStore.fields[fieldname].value;
  };
</script>

<div class="field" use:clickOutside={{ cb: () => (showChoices = false) }}>
  {#if field.label}<label class="label" for={field.id}>{field.label}</label>{/if}
  <div class="tags-input input field is-grouped is-grouped-multiline">
    {#each fieldDisplayValue as { label, value }, i (value)}
      <div class="control">
        <div class="tags has-addons">
          <span class="tag">{label}</span>
          <span class="tag is-delete is-danger is-light" on:click={() => removeTag(i)} />
        </div>
      </div>
    {/each}
    <div class="control is-expanded">
      <TagInput
        id={field.id}
        placeholder={fieldDisplayValue.length ? undefined : placeholder}
        bind:inputValue
        on:enter={enter}
        on:backspace={() => removeTag()}
        on:up={upArrow}
        on:down={downArrow}
        on:focus={() => (showChoices = true)}
        on:blur={blur} />
    </div>
    {#if choices}
      <TagChoices
        {choices}
        {enableScroll}
        bind:showChoices
        bind:hoveredItemIndex
        on:click={click} />
    {/if}
  </div>
  {#if field.errors.length}
    <p class="help is-danger" transition:slide|local>{field.errors.join('. ')}</p>
  {/if}
</div>

<style lang="scss">
  .tag {
    user-select: none;
    position: relative;
  }

  .tags-input {
    height: auto !important;
  }

  .control {
    margin-bottom: 0.1em !important;
    margin-top: 0.1em !important;
  }
</style>
