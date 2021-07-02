<script>
  import type { BarChartDataset, XBand, YValue } from './types';

  import Base from './base.svelte';
  import IdAxis from './axis/idAxis.svelte';
  import ValueAxis from './axis/valueAxis.svelte';

  import { axisBottom, axisLeft } from 'd3-axis';

  export let data: BarChartDataset;

  export let padding = 0.3;

  export let displayValue: (val: number) => string;

  let y: YValue | undefined, x: XBand | undefined;

  $: getY = (value: number) => {
    const zero = y!(0);
    return value < 0 ? zero : zero - (zero - y!(value));
  };

  let hoveredId: string | null = null;
</script>

<Base svgHeight={300} let:width let:height>
  <ValueAxis
    {data}
    gridDirection="left"
    axisBuilder={axisLeft}
    rangeMax={height}
    gridSize={width}
    bind:scale={y} />

  {#if y && x}
    {#each data as { id, color, value } (id)}
      <g on:mouseover={() => (hoveredId = id)} on:mouseleave={() => (hoveredId = null)}>
        <rect
          x={x(id)}
          width={x.bandwidth()}
          y={getY(value)}
          height={Math.abs(y(0) - y(value))}
          opacity={hoveredId == id ? 0.8 : 1}
          style="fill: {color}" />
        <text
          x={(x(id) || 0) + x.bandwidth() / 2}
          y={getY(value) - 10}
          style={id == hoveredId ? '' : 'display: none'}>
          <tspan class="value">{displayValue(value)}</tspan></text>
      </g>
    {/each}
  {/if}

  <IdAxis
    {data}
    {padding}
    axisBuilder={axisBottom}
    rangeMax={width}
    heightTranslate={y?.(0) || 0}
    bind:scale={x} />
</Base>

<style lang="scss">
  rect {
    // Fallback color
    fill: $green;
  }

  text {
    @include z(text-on-barchart);
    text-anchor: middle;
    font-size: 76%;
  }
</style>
