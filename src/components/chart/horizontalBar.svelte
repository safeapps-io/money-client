<script>
  import type { BarChartDataset, XBand, YValue } from './types';

  import { number } from 'svelte-i18n';

  import Base from './base.svelte';
  import IdAxis from './axis/idAxis.svelte';
  import ValueAxis from './axis/valueAxis.svelte';
  import { axisBottom, axisLeft } from 'd3-axis';

  export let data: BarChartDataset;

  export let heightPerBar = 50,
    padding = 0.3;

  let y: XBand | undefined, x: YValue | undefined;

  let hoveredId: string | null = null;

  /**
   * FIXME: Решить проблему лейблов, вылезающих за пределычарта. Хз как :)
   * А еще надо дропнуть, наконец, chartjs!!!!!!!!!
   */
</script>

<Base svgHeight={100 + data.length * heightPerBar} let:width let:height>
  <ValueAxis
    {data}
    axisBuilder={axisBottom}
    rangeMax={width}
    gridSize={height}
    heightTranslate={height}
    gridDirection="bottom"
    bind:scale={x} />

  {#if y && x}
    {#each data as { id, color, value } (id)}
      <g on:mouseover={() => (hoveredId = id)} on:mouseleave={() => (hoveredId = null)}>
        <rect
          x={0}
          width={x(value)}
          y={y(id)}
          height={y.bandwidth()}
          opacity={hoveredId == id ? 0.8 : 1}
          style="fill: {color}" />
        <text x={x(value) - 10} y={y(id)} style={id == hoveredId ? '' : 'display: none'}
          >{$number(value)}</text>
      </g>
    {/each}
  {/if}

  <IdAxis {data} {padding} axisBuilder={axisLeft} rangeMax={height} bind:scale={y} />
</Base>

<style lang="scss">
  rect {
    // Fallback color
    fill: $green;
  }

  text {
    z-index: 2;
    text-anchor: middle;
    font-size: 76%;
  }
</style>
