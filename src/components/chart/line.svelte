<script>
  import type { GetLine, LineChartDataset, XTime, YValue } from './types';

  import Base from './base.svelte';
  import TimeAxis from './axis/timeAxis.svelte';
  import ValueAxis from './axis/valueAxis.svelte';
  import HoverTracker from './axis/hoverTracker.svelte';

  import { date, _ } from 'svelte-i18n';
  import { axisLeft } from 'd3-axis';

  import { setLine, line } from './common';

  export let data: LineChartDataset;

  export let displayValue: (val: number) => string;

  let y: YValue | undefined, x: XTime | undefined;

  let getLine: GetLine<ArrayItem<LineChartDataset>> | undefined;
  $: if (x && y && data.length > 1)
    getLine = line<ArrayItem<LineChartDataset>>()
      .x(d => x!(d.date))
      .y(d => y!(d.value));

  let focusPoint: ArrayItem<LineChartDataset> | null,
    focusPointX: number | null,
    focusPointY: number | null,
    fixedPosition: boolean;
</script>

<Base svgHeight={300} let:width let:height>
  <ValueAxis
    {data}
    gridDirection="left"
    axisBuilder={axisLeft}
    rangeMax={height}
    gridSize={width}
    bind:scale={y} />
  <TimeAxis
    {data}
    rangeMax={width}
    gridSize={height}
    gridDirection="bottom"
    heightTranslate={y?.(0) || 0}
    ticks={width > 300 ? 5 : 3}
    bind:scale={x} />

  {#if data.length == 1}
    <circle
      class="single-point"
      cx={x?.(data[0].date)}
      cy={y?.(data[0].value)}
      r={fixedPosition ? 4 : 2}
      stroke-width={fixedPosition ? 2 : 1}
      fill="white" />
  {:else}
    <g class="line" use:setLine={{ getLine, data }} />
  {/if}
  <!-- svelte-ignore component-name-lowercase -->
  {#if focusPoint && focusPointY && focusPointX}
    <circle
      cx={focusPointX}
      cy={focusPointY}
      r={fixedPosition ? 4 : 2}
      stroke-width={fixedPosition ? 2 : 1}
      fill="white"
      stroke="gray" />
    <line
      x1={focusPointX}
      x2={focusPointX}
      y1={0}
      y2={height}
      stroke-dasharray="2 2"
      stroke="gray" />
    <line
      x1="0"
      x2={width}
      y1={focusPointY}
      y2={focusPointY}
      stroke-dasharray="2 2"
      stroke="gray" />
  {/if}
  <HoverTracker
    {width}
    {height}
    {x}
    {y}
    {data}
    bind:focusPoint
    bind:fixedPosition
    bind:yVal={focusPointY}
    bind:xVal={focusPointX} />

  <svelte:fragment slot="overlay-div" let:marginTop let:marginLeft>
    {#if focusPoint && x && y}
      <div class="tooltip is-size-7" class:fixedPosition>
        <p
          class="x"
          style="--top: {y(0) + marginTop}px; --left: {x(focusPoint.date) + marginLeft}px">
          {$date(focusPoint.date)}
        </p>
        <p class="y" style="--top: {y(focusPoint.value) + marginTop}px; --left: {marginLeft}px">
          {displayValue(focusPoint.value)}
        </p>
      </div>
    {/if}
  </svelte:fragment>
</Base>

<style lang="scss">
  .line {
    :global(path),
    :global(circle),
    :global(line) {
      stroke: $green;
    }
  }
  .single-point {
    stroke: $green;
  }

  .tooltip {
    // Making it possible to move mouse over numbers and copy, when position is fixed.
    pointer-events: none;
    &.fixedPosition {
      pointer-events: unset;
    }

    p {
      position: absolute;
      top: var(--top);
      left: var(--left);

      $text-shadow: 0 0 3px white;
      text-shadow: $text-shadow, $text-shadow, $text-shadow, $text-shadow, $text-shadow,
        $text-shadow;

      &.x {
        transform: translate(-50%, -100%);
      }

      &.y {
        transform: translate(-100%, -50%);
      }
    }
  }
</style>
