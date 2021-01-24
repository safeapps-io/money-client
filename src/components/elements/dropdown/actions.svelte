<script>
  import Dropdown from './generic.svelte';
</script>

<Dropdown right let:hide>
  <div slot="trigger" let:id let:onTriggerClick>
    <button
      class="button is-text is-small"
      aria-haspopup="true"
      aria-controls={id}
      on:click={onTriggerClick}>
      <span class="icon is-small">
        <!-- © https://teenyicons.com/ more-vertical -->
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15">
          <path
            d="M7.5 3a.5.5 0 110-1 .5.5 0 010 1zm0 5a.5.5 0 110-1 .5.5 0 010 1zm0 5a.5.5 0 110-1
            .5.5 0 010 1z"
            stroke="currentColor" />
        </svg>
      </span>
    </button>
  </div>

  <slot {hide} />
</Dropdown>
