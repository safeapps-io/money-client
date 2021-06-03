<script>
  export let className: string | undefined = undefined,
    play: boolean = true;

  /**
   * Heavily borrowed from here:
   * https://css-tricks.com/animate-a-container-on-mouse-over-using-perspective-and-transform/
   */

  let wrapperEl: HTMLDivElement | undefined, innerEl: HTMLDivElement | undefined;

  let originX = 0,
    originY = 0;
  $: if (wrapperEl) {
    originX = wrapperEl.offsetLeft + Math.floor(wrapperEl.offsetWidth / 2);
    originY = wrapperEl.offsetTop + Math.floor(wrapperEl.offsetHeight / 2);
  }

  let x: number = 0,
    y: number = 0;
  $: xDeg = x.toFixed(2);
  $: yDeg = y.toFixed(2);

  $: if (!play) x = y = 0;

  let counter = 0;
  const updateRate = 10,
    isTimeToUpdate = () => counter++ % updateRate === 0;

  const enter = (e: MouseEvent) => {
      if (!play || !innerEl) return;

      const _x = e.clientX - originX,
        _y = (e.clientY - originY) * -1;

      x = _y / innerEl.offsetHeight / 2;
      y = _x / innerEl.offsetWidth / 2;
    },
    move = (e: MouseEvent) => {
      if (!isTimeToUpdate()) return;
      enter(e);
    };

  const mouseLeave = () => (x = y = 0.0);

  $: style = `--x: ${xDeg}deg; --y: ${yDeg}deg`;
</script>

<div
  class="wrapper {className}"
  bind:this={wrapperEl}
  on:mouseenter={enter}
  on:mousemove={move}
  on:mouseleave={mouseLeave}>
  <div class="inner" bind:this={innerEl} {style}>
    <slot />
  </div>
</div>

<style>
  .wrapper {
    perspective: 40px;
  }

  .inner {
    transition: transform 0.5s;

    transform: rotateX(var(--x)) rotateY(var(--y));
  }
</style>
