<script>
  import type { Writable } from 'svelte/store';

  import { onMount } from 'svelte';
  import { expoOut, sineInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';

  export let replayAnimationKey: string | number;

  const duration = 500;

  let slotHeight: number | undefined,
    heightTweened: Writable<number> | undefined,
    inDuration = 0;

  onMount(() => {
    heightTweened = tweened(slotHeight, { duration, easing: expoOut });
    inDuration = duration;
  });
  $: if (typeof slotHeight != 'undefined' && typeof heightTweened != 'undefined')
    $heightTweened = slotHeight;
  $: setHeight = typeof heightTweened == 'undefined' ? 'auto' : `${$heightTweened}px`;

  let noOverflow = true;
  const set = () => (noOverflow = true),
    unset = () => (noOverflow = false);
</script>

<div class="wrapper" class:no-overflow={noOverflow} style={`height: ${setHeight}`}>
  {#key replayAnimationKey}
    <div
      class="slot"
      in:fade={{ easing: sineInOut, duration: inDuration }}
      out:fade|local={{ easing: sineInOut }}
      on:introstart={set}
      on:outrostart={set}
      on:introend={unset}
      on:outroend={unset}
      bind:clientHeight={slotHeight}>
      <slot />
    </div>
  {/key}
</div>

<style lang="scss">
  .wrapper {
    position: relative;
    width: 100%;
  }

  .no-overflow {
    overflow: hidden;
  }

  .slot {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
  }
</style>
