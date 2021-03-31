<script>
  import type { LabeledChoice } from '$components/strict/base';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  export let choices: LabeledChoice[],
    showChoices: boolean,
    hoveredItemIndex: null | number,
    enableScroll: boolean;

  let ulRef: HTMLUListElement,
    liRefs: HTMLLIElement[] = [];

  const dispatch = createEventDispatcher();

  let prevIndex = hoveredItemIndex;
  $: {
    if (ulRef && enableScroll && hoveredItemIndex !== null) {
      // If prevIndex is 0, we could jump to the end of the list by going up from first item.
      // In that case we're still going up, even though the index tells otherwise.
      const goingDown = prevIndex === null ? true : prevIndex != 0 && hoveredItemIndex > prevIndex,
        el = liRefs[hoveredItemIndex];

      /**
       * In order to understand all this you need to understand what all these properties mean.
       *
       * Container:
       * offsetTop — pixels from the top of the document to the top of the container
       * scrollHeight — the whole height of the container including the overflow
       * offsetHeight — the height of the visible part of the container
       * scrollTop — pixels from the top of the container including the overflow to the top of the visible part
       *
       * Item:
       * offsetTop — pixels from the top of the container including the overflow
       * scrollHeight/offsetHeight — the height of the item
       *
       * If the element is inside the visible part of the container, we do nothing.
       * The rest is self-explainatory.
       */

      if (el) {
        const containerTop = ulRef.scrollTop,
          containerBottom = containerTop + ulRef.offsetHeight,
          elTop = el.offsetTop,
          elBottom = elTop + el.scrollHeight,
          insideScrollView = elTop >= containerTop && elBottom <= containerBottom;

        if (!insideScrollView) {
          if (goingDown) ulRef.scrollTop = elBottom - ulRef.offsetHeight;
          else ulRef.scrollTop = elTop;
        }
      }
    }

    prevIndex = hoveredItemIndex;
  }
</script>

<ul class="choices" class:is-hidden={!showChoices} bind:this={ulRef}>
  {#each choices as { label, value }, index (value)}
    <li
      class="py-2 px-2"
      class:is-hovered={index === hoveredItemIndex}
      on:mouseover={() => (hoveredItemIndex = index)}
      on:mouseout={() => hoveredItemIndex === index && (hoveredItemIndex = null)}
      on:click={() => dispatch('click', index)}
      bind:this={liRefs[index]}>
      {label || value}
    </li>
  {:else}
    <li class="py-2 px-2">{$_('common.form.noChoices')}</li>
  {/each}
</ul>

<style lang="scss">
  .choices {
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;

    @include z(tag-choices-dropdown);

    max-height: 250px;
    overflow-y: scroll;

    border: solid $turquoise;
    border-width: 0 $border-width $border-width $border-width;
    background-color: white;

    &.is-hidden {
      visibility: hidden;
    }

    & > li {
      cursor: pointer;

      &.is-hovered {
        background-color: change-color($turquoise, $alpha: 0.1);
      }
    }
  }
</style>
