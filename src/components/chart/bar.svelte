<script>
  import type { BarChartDataset, XBand, YValue } from './types';

  import { number } from 'svelte-i18n';

  import Base from './base.svelte';
  import IdX from './axis/idX.svelte';
  import ValueY from './axis/valueY.svelte';

  export let data: BarChartDataset;

  export let padding = 0.3;

  let y: YValue | undefined, x: XBand | undefined;

  $: getY = (value: number) => {
    const zero = y!(0);
    return value < 0 ? zero : zero - (zero - y!(value));
  };

  let hoveredId: string | null = null;
</script>

<Base svgHeight={300} let:width let:height>
  <ValueY {data} {height} {width} bind:y />

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
          x={x(id) + x.bandwidth() / 2}
          y={getY(value) - 10}
          style={id == hoveredId ? '' : 'display: none'}>{$number(value)}</text>
      </g>
    {/each}
  {/if}

  <IdX {data} {width} {padding} y={y?.(0) || 0} bind:x />
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
