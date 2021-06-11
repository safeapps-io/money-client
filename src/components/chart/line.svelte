<script>
  import type { GetLine, LineChartDataset, XTime, YValue } from './types';

  import { date, number } from 'svelte-i18n';

  import { fillBlankDate, setLine, line } from './common';

  import Base from './base.svelte';
  import TimeX from './axis/timeX.svelte';
  import ValueY from './axis/valueY.svelte';
  import HoverTracker from './axis/hoverTracker.svelte';

  export let data: LineChartDataset;
  $: filledBlanks = fillBlankDate(data);

  let y: YValue | undefined, x: XTime | undefined;

  let getLine: GetLine<ArrayItem<LineChartDataset>> | undefined;
  $: if (x && y)
    getLine = line<ArrayItem<LineChartDataset>>()
      .x(d => x!(d.date))
      .y(d => y!(d.value));

  let focusPoint: ArrayItem<LineChartDataset> | null,
    focusPointX: number | null,
    focusPointY: number | null,
    fixedPosition: boolean;
</script>

<Base svgHeight={300} let:width let:height>
  <ValueY {data} {height} {width} bind:y />
  <TimeX {data} {width} {height} y={y?.(0) || 0} bind:x />

  <g use:setLine={{ getLine, data: filledBlanks }} />
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
    data={filledBlanks}
    bind:focusPoint
    bind:fixedPosition
    bind:yVal={focusPointY}
    bind:xVal={focusPointX} />

  <svelte:fragment slot="overlay-div">
    {#if focusPoint}
      <div class="tooltip px-3 py-2">
        <p>Дата: {$date(focusPoint.date)}</p>
        <p>Значение: {$number(focusPoint.value)}</p>
      </div>
    {/if}
  </svelte:fragment>
</Base>

<style lang="scss">
  g {
    :global(path),
    :global(circle),
    :global(line) {
      stroke: $green;
    }
  }

  .tooltip {
    position: absolute;
    top: 30px;
    left: 45px;

    font-size: 75%;
    background-color: $white;
  }
</style>
