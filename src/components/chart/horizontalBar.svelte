<script>
  import type { BarChartDataset, XBand, YValue } from './types';

  import Base from './base.svelte';
  import IdAxis from './axis/idAxis.svelte';
  import ValueAxis from './axis/valueAxis.svelte';

  import { axisBottom, axisLeft } from 'd3-axis';

  export let data: BarChartDataset;

  export let displayValue: (val: number) => string;

  export let heightPerBar = 50,
    padding = 0.3;

  let y: XBand | undefined, x: YValue | undefined;

  let hoveredId: string | null = null;
</script>

<Base svgHeight={100 + data.length * heightPerBar} let:width let:height>
  <ValueAxis
    {data}
    axisBuilder={axisBottom}
    domainOrder="usual"
    rangeMax={width}
    gridSize={height}
    heightTranslate={height}
    gridDirection="bottom"
    bind:scale={x} />

  {#if y && x}
    {#each data as { id, color, value, label } (id)}
      <g on:mouseover={() => (hoveredId = id)} on:mouseleave={() => (hoveredId = null)}>
        <rect
          x={0}
          width={x(value)}
          y={y(id)}
          height={y.bandwidth()}
          opacity={hoveredId == id ? 0.8 : 1}
          style="fill: {color}" />
        <text x={10} y={(y(id) || 0) + y.bandwidth() / 2}>
          {label}
          <tspan class="value" style={id == hoveredId ? '' : 'display: none'}>
            {'  ' + displayValue(value)}
          </tspan>
        </text>
      </g>
    {/each}
  {/if}

  <IdAxis hideLabels {data} {padding} axisBuilder={axisLeft} rangeMax={height} bind:scale={y} />
</Base>

<style lang="scss">
  rect {
    // Fallback color
    fill: $green;
  }

  text {
    @include z(text-on-barchart);
    text-anchor: start;
    dominant-baseline: middle;
    font-size: 75%;
  }
</style>
