<script>
  import type { Writable } from 'svelte/store';

  import { onMount } from 'svelte';
  import { expoOut, sineInOut } from 'svelte/easing';
  import { fade } from 'svelte/transition';
  import { tweened } from 'svelte/motion';

  import { resize } from '$utils/actions/resize';

  export let key: string | number;

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

  $: console.log({ slotHeight, setHeight });

  let noOverflow = true;
  const set = () => (noOverflow = true),
    unset = () => (noOverflow = false);

  /**
   * `bind:clientHeight` failed in cases, when the content of the slot changes.
   * I didn't really catch when and why.
   *
   * (same in `onboarding.svelte`)
   */
  const resizeTrigger = (el: HTMLElement) => {
    if (heightTweened) slotHeight = el.getBoundingClientRect().height;
  };
</script>

<div class="wrapper" class:no-overflow={noOverflow} style="height: {setHeight}">
  {#key key}
    <div
      class="fullwidth-absolute"
      in:fade={{ easing: sineInOut, duration: inDuration }}
      out:fade|local={{ easing: sineInOut }}
      on:introstart={set}
      on:outrostart={set}
      on:introend={unset}
      on:outroend={unset}
      use:resize={resizeTrigger}>
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

  .fullwidth-absolute {
    top: 0;
  }
</style>
