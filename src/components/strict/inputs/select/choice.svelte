<script>
  import type { Choices } from '@/components/strict/base';

  export let choices: Choices;
</script>

{#each choices as choice}
  {#if typeof choice == 'string'}
    <option value={choice}>{choice}</option>
  {:else if 'group' in choice}
    <optgroup label={choice.group}>
      <svelte:self choices={choice.choices} />
    </optgroup>
  {:else}
    <option value={choice.value} disabled={choice.disabled}>{choice.label || choice.value}</option>
  {/if}
{/each}
