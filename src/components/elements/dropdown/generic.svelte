<script>
  import { fly } from 'svelte/transition';
  import caretVerticalSmallIcon from 'teenyicons/outline/caret-vertical-small.svg';

  import { clickOutside } from '$utils/actions/clickOutside';

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
  use:clickOutside={{ cb: hide, enabled: show }}>
  <div class="dropdown-trigger">
    <slot name="trigger" {id} {onTriggerClick}>
      <button
        class="button is-light"
        aria-haspopup="true"
        aria-controls={id}
        on:click={onTriggerClick}>
        <span>{triggerText}</span>
        <span class="icon is-small">
          <img src={caretVerticalSmallIcon} alt="down" height="18" width="18" />
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
      transition:fly|local={{ y: -10, duration: 200 }}>
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
