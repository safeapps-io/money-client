<script>
  // IDEA: Do this using SVG blobs. Will look cooler (probably).
  // IDEA: We add a button inside text-slot a lot, and it often either finishes the onboarding,
  // or goes to the next step. Should we put the button here?

  import type { OnboardingSteps } from '$stores/decr/user';

  import { fade, fly, scale } from 'svelte/transition';
  import cssVars from 'svelte-css-vars';
  import { browser } from '$app/env';
  import { onDestroy } from 'svelte';

  import { randBetween } from '$utils/random';
  import { range } from '$utils/array';
  import { generateRandomColor } from '$utils/color';
  import { resize } from '$utils/actions/resize';
  import { restrictBodyScroll } from '$utils/actions/restrictBodyScroll';

  import { hasUserSeenOnboarding, setUserOnboardingSetting } from '$stores/decr/user';
  import { debugLog } from '$core/logger';

  export let shouldShow: boolean,
    key: OnboardingSteps | undefined = undefined,
    delay = 700,
    textSlotWidth = 300,
    preventSlotClick = false,
    noSlot = false,
    bottom = false,
    right = false;

  // If `key` is undefined, we treat it as if it has never been shown.
  // Otherwise we lookup in the settings.
  $: shownKeyBefore = typeof key != 'undefined' && $hasUserSeenOnboarding(key);

  /**
   * We lock the scroll immediately, but delay showing the onboarding.
   * This way the onboarding does not break.
   */
  let startShowing = false,
    isShowing = false,
    timeout: number | undefined;
  $: if (browser) {
    clearTimeout(timeout);
    if (shouldShow && !shownKeyBefore) {
      startShowing = true;
      timeout = window.setTimeout(() => (isShowing = true), delay);
    } else isShowing = false;
  }
  onDestroy(() => clearTimeout(timeout));

  const finishOnboarding = async () => {
    if (key) {
      debugLog('[onboarding] saving onboarding as seen', key);
      await setUserOnboardingSetting(key);
    }
    startShowing = false;
  };

  let slotHeight: number | undefined,
    innerWidth: number | undefined,
    innerHeight: number | undefined,
    slotEl: HTMLDivElement | undefined,
    textSlotEl: HTMLDivElement | undefined;

  const getPositionalVars = (top: number, left: number, width?: number, height?: number) => ({
      top: top + 'px',
      left: left + 'px',
      width: width ? width + 'px' : 'auto',
      height: height ? height + 'px' : 'auto',
    }),
    [circleColors, squareColors] = range(2).map(() =>
      Object.fromEntries(
        ['bg1', 'bg2', 'bg3', 'shadow'].map(color => [color, generateRandomColor()]),
      ),
    ),
    circleSize = randBetween(150, 250),
    squareSize = randBetween(300, 400);

  let slotVars = {},
    squareVars = {},
    circleVars = {},
    textVars = {};

  /**
   * `bind:clientHeight` failed in cases, when the content of the slot changes.
   * I didn't really catch when and why.
   *
   * (same in `crossfadeWrapper.svelte`)
   */
  const slotResized = (e: Element) => {
    const { height } = e.getBoundingClientRect();
    if (height) slotHeight = height;
  };

  $: originalSlotRect =
    startShowing && slotEl && slotHeight && innerHeight && innerWidth
      ? (slotEl.firstChild as HTMLElement)?.getBoundingClientRect()
      : null;

  // Setting slot copy variables
  $: if (originalSlotRect) {
    const { x, y, width, height } = originalSlotRect;
    slotVars = getPositionalVars(scrollY + y, scrollX + x, width, height);
  }

  // Setting figures variables
  const getEvenCoordsByCenterPoint = (x: number, y: number, neededSize: number) =>
    getPositionalVars(bottom ? y : y - neededSize / 2, x - neededSize / 2, neededSize, neededSize);
  $: if (originalSlotRect) {
    const { x, y, width, height } = originalSlotRect,
      centerCoords: [number, number] = [scrollX + x + width / 2, scrollY + y + height / 2];

    circleVars = {
      ...getEvenCoordsByCenterPoint(...centerCoords, squareSize),
      ...circleColors,
    };
    squareVars = {
      ...getEvenCoordsByCenterPoint(...centerCoords, circleSize),
      ...squareColors,
    };
  }
  $: if (noSlot && innerHeight && innerWidth) {
    const vertCenter = innerHeight / 2,
      horCenter = innerWidth / 2;
    circleVars = {
      ...getEvenCoordsByCenterPoint(horCenter, vertCenter, squareSize),
      ...circleColors,
    };
    squareVars = {
      ...getEvenCoordsByCenterPoint(horCenter, vertCenter, circleSize),
      ...squareColors,
    };
  }

  // Setting text variables
  $: if (originalSlotRect && textSlotEl) {
    const margin = 30,
      { scrollY, scrollX } = window,
      { x, y, width, height } = originalSlotRect,
      { height: textSlotHeight } = textSlotEl.getBoundingClientRect();

    const top = bottom ? scrollY + y + height + margin : scrollY + y - textSlotHeight - margin,
      left = right ? scrollX + x + width - textSlotWidth : scrollX + x;

    textVars = getPositionalVars(top, left);
  }

  $: if (textSlotEl && noSlot && innerHeight && innerWidth) {
    const { height: textSlotHeight } = textSlotEl.getBoundingClientRect();
    textVars = getPositionalVars(
      innerHeight / 2 - textSlotHeight / 2,
      innerWidth / 2 - textSlotWidth / 2,
    );
  }
</script>

<svelte:window bind:innerWidth bind:innerHeight />

<div style="display: none" use:restrictBodyScroll={startShowing} />
{#if isShowing}
  <div class="overlay" transition:fade|local />
  <div class="figures" class:centered={noSlot} transition:scale|local={{ delay: 300 }}>
    <div class="circle" use:cssVars={circleVars} />
    <div class="square" use:cssVars={squareVars} />
  </div>
  <div
    class="text"
    class:centered={noSlot}
    class:has-text-right={right}
    class:has-text-left={!right}
    bind:this={textSlotEl}
    use:cssVars={{ ...textVars, width: `${textSlotWidth}px` }}
    in:fly|local={{ delay: 600, y: 100 }}
    out:fade|local>
    <slot name="text" />
  </div>
  {#if preventSlotClick}
    <div class="prevent-click-overlay" use:cssVars={slotVars} />
  {/if}
{/if}

<div
  class="slot"
  class:active={startShowing}
  bind:this={slotEl}
  bind:clientHeight={slotHeight}
  use:resize={slotResized}>
  <slot show={isShowing} {finishOnboarding} />
</div>

<style lang="scss">
  .slot.active {
    position: relative;
    @include z(onboarding-slot);

    :global(.help),
    :global(.label) {
      $shadow-size: 2px;
      $shadow-color: rgba(255, 255, 255, 0.7);
      $shadow: drop-shadow($shadow-size $shadow-size $shadow-size $shadow-color)
        drop-shadow($shadow-size * -1 $shadow-size * -1 $shadow-size $shadow-color);

      filter: $shadow $shadow;
    }
  }

  .overlay,
  .figures {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    @include z(onboarding);
  }

  .overlay {
    background: rgba(255, 255, 255, 0.85);
    filter: grayscale(1);

    @supports (backdrop-filter: blur(3px)) {
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(3px);
    }
  }

  .prevent-click-overlay,
  .text,
  .square,
  .circle {
    position: fixed;
    top: var(--top);
    left: var(--left);
    width: var(--width);
    height: var(--height);

    @include z(onboarding);
  }

  .prevent-click-overlay {
    @include z(onboarding-slot-overlay);

    cursor: not-allowed;
  }

  .circle,
  .square {
    background: linear-gradient(217deg, var(--bg1), rgba(255, 0, 0, 0) 70.71%),
      linear-gradient(127deg, var(--bg2), rgba(0, 255, 0, 0) 70.71%),
      linear-gradient(336deg, var(--bg3), rgba(0, 0, 255, 0) 70.71%);
  }

  .circle {
    border-radius: 45%;
    box-shadow: 0 0 4em 2em var(--shadow);

    @keyframes circle-anim {
      40% {
        transform: translateX(-120px) translateY(-40px) rotate(20deg);
      }
    }
    transform: translateX(-80px) translateY(-50px) rotate(20deg);
    animation: circle-anim 4s ease-in-out;
  }

  .square {
    border-radius: 20%;

    box-shadow: 0 0 3.5em 1.1em var(--shadow);
    mix-blend-mode: hard-light;
    transform-origin: center;

    @keyframes square-anim {
      60% {
        transform: translateX(80px) translateY(60px) rotate(95deg);
      }
    }
    transform: translateX(120px) translateY(40px) rotate(45deg);
    animation: square-anim 4s ease-in-out;
  }
</style>
