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
  import { restrictBodyScroll } from '$utils/actions/restrictBodyScroll';

  import { hasUserSeenOnboarding, setUserOnboardingSetting } from '$stores/decr/user';
  import { debugLog } from '$core/logger';

  export let shouldShow: boolean,
    key: OnboardingSteps | undefined = undefined,
    delay = 700,
    textSlotWidth = 300,
    preventSlotClick = false,
    noSlot = false,
    hideFigures = false,
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
    } else {
      isShowing = false;
      startShowing = false;
    }
  }
  onDestroy(() => clearTimeout(timeout));

  const finishOnboarding = async () => {
    if (key) {
      debugLog('[onboarding] saving onboarding as seen', key);
      await setUserOnboardingSetting(key);
    }
    startShowing = false;
  };

  const [circleColors, squareColors] = range(2).map(() =>
    Object.fromEntries(
      ['bg1', 'bg2', 'bg3', 'shadow'].map(color => [color, generateRandomColor()]),
    ),
  );
</script>

{#if isShowing}
  <div class="overlay" transition:fade|local />
{/if}

<div class="slot" class:active={startShowing}>
  <div style="display: none" use:restrictBodyScroll={startShowing} />
  {#if isShowing}
    <div
      class="figures"
      class:noSlot
      class:right
      class:left={!right}
      class:bottom
      class:top={!bottom}
      style="--width: {textSlotWidth}px; {hideFigures ? 'display: none' : ''}"
      transition:scale|local={{ delay: 300 }}>
      <div class="circle" use:cssVars={{ ...circleColors, size: `${randBetween(150, 250)}px` }} />
      <div class="square" use:cssVars={{ ...squareColors, size: `${randBetween(200, 300)}px` }} />
    </div>
    <div
      class="text"
      class:noSlot
      class:right
      class:left={!right}
      class:bottom
      class:top={!bottom}
      style="--width: {textSlotWidth}px"
      in:fly|local={{ delay: 600, y: bottom ? 100 : -100 }}
      out:fade|local>
      <slot name="text" />
    </div>
    {#if preventSlotClick}
      <div class="prevent-click-overlay" />
    {/if}
  {/if}

  <slot show={isShowing} {finishOnboarding} />
</div>

<style lang="scss">
  .slot {
    position: relative;

    &.active {
      @include z(onboarding);

      :global(.help),
      :global(.label) {
        $shadow-size: 2px;
        $shadow-color: rgba(255, 255, 255, 0.7);
        $shadow: drop-shadow($shadow-size $shadow-size $shadow-size $shadow-color)
          drop-shadow($shadow-size * -1 $shadow-size * -1 $shadow-size $shadow-color);

        filter: $shadow $shadow;
      }
    }
  }

  .overlay {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    @include z(onboarding);

    background: rgba(255, 255, 255, 0.85);
    filter: grayscale(1);

    @supports (backdrop-filter: blur(3px)) {
      background: rgba(255, 255, 255, 0.35);
      backdrop-filter: blur(3px);
    }
  }

  .prevent-click-overlay {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;
    left: 0;

    @include z(onboarding-slot-overlay);

    cursor: not-allowed;
  }

  .figures {
    height: var(--width);
    --base-translate: 50%;
  }
  .text {
    --base-translate: 100%;
  }

  .text,
  .figures {
    position: absolute;
    width: var(--width);

    &.left {
      left: 0;
    }
    &.right {
      right: 0;
      text-align: right;
    }
    &.bottom {
      bottom: -10px;
      transform: translateY(var(--base-translate));
    }
    &.top {
      top: -10px;
      transform: translateY(calc(var(--base-translate) * -1));
    }

    &.noSlot {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .circle,
  .square {
    position: absolute;
    left: 0;

    width: 90%;
    height: var(--size);
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
