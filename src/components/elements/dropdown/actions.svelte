<script>
  import Dropdown from './generic.svelte';

  import moreVerticalIcon from 'teenyicons/outline/more-vertical.svg';
</script>

<Dropdown right let:hide>
  <div slot="trigger" let:id let:onTriggerClick>
    <button
      class="button is-text is-small"
      aria-haspopup="true"
      aria-controls={id}
      on:click={onTriggerClick}>
      <span class="icon is-small">
        <img src={moreVerticalIcon} alt="more" width="15" height="15" />
      </span>
    </button>
  </div>

  <slot {hide} />
</Dropdown>
