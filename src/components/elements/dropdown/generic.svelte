<script>
  import { fly } from 'svelte/transition';

  import { clickOutside } from '@/utils/actions/clickOutside';

  export let triggerText = '',
    show: boolean = false,
    centered: boolean = false,
    right: boolean = false,
    fullwidth: boolean = false;

  const id = Math.random().toString(),
    onTriggerClick = () => (show = !show),
    hide = () => (show = false);
</script>

<div
  class="dropdown is-active"
  class:fullwidth
  class:is-right={right}
  use:clickOutside={{ cb: hide, enabled: show }}
>
  <div class="dropdown-trigger">
    <slot name="trigger" {id} {onTriggerClick}>
      <button
        class="button is-light"
        aria-haspopup="true"
        aria-controls={id}
        on:click={onTriggerClick}>
        <span>{triggerText}</span>
        <span class="icon is-small">
          <!-- © https://teenyicons.com/ caret-vertical-small -->
          <svg
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18">
            <path
              d="M10 9l-2.5 2L5 9m0-3l2.5-2L10 6"
              stroke="currentColor"
              stroke-linecap="square"
            />
          </svg>
        </span>
      </button>
    </slot>
  </div>
  {#if show}
    <div
      class="dropdown-menu mt-1"
      class:centered
      {id}
      role="menu"
      transition:fly|local={{ y: -10, duration: 200 }}
    >
      <div class="dropdown-content">
        <slot {hide} />
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .dropdown-content {
    min-width: var(--dropdown-min-width);
  }
</style>
