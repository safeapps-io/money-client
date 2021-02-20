<script>
  import Generic from './generic.svelte';

  import { _ } from 'svelte-i18n';

  export let text: string | undefined = undefined;

  let show: boolean;
</script>

<Generic bind:show {...$$restProps}>
  <div slot="trigger" let:id let:onTriggerClick>
    <button
      class="button is-ghost is-small"
      class:is-focused={show}
      aria-haspopup="true"
      aria-controls={id}
      on:click={onTriggerClick}>
      <span class="icon">
        <!-- © https://teenyicons.com/ question-circle -->
        <svg
          viewBox="0 0 15 15"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          ><path
            d="M7.5 9V7.5H8A1.5 1.5 0 009.5 6v-.1a1.4 1.4 0 00-1.4-1.4h-.6A1.5 1.5 0 006 6m1 4.5h1m-.5 4a7 7 0 110-14 7 7 0 010 14z"
            stroke="currentColor" /></svg>
      </span>
      <span>{text || $_('cmps.import.queue.troubleshoot.title')}</span>
    </button>
  </div>

  <slot />
</Generic>
