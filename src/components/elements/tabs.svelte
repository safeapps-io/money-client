<script>
  import type { LabeledChoice } from '$components/strict/base';

  import { focusableShortcut } from '$utils/actions/shortcut';

  export let tabs: LabeledChoice[],
    sticky: boolean = false,
    classes: string = '',
    activeTab: any;
</script>

<div class={`tabs ${classes}`} class:sticky>
  <ul>
    {#each tabs as tab}
      <li class:is-active={tab.value == activeTab}>
        <!-- svelte-ignore a11y-missing-attribute -->
        <a
          class="clickable"
          role="button"
          tabindex="0"
          on:click={() => (activeTab = tab.value)}
          use:focusableShortcut><slot {tab}>{tab.label || tab.value}</slot></a>
      </li>
    {/each}
  </ul>
</div>
