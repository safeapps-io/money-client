<script>
  import { fade } from 'svelte/transition';

  export let notification: any;
  export let onRemove: () => void;

  const { text, type } = notification;
  $: classes = `notification is-${type} is-light`;
</script>

<div transition:fade class={classes}>
  <button class="delete" on:click={onRemove} />
  <slot>{text}</slot>
</div>
