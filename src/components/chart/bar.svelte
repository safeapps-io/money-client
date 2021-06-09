<script>
  import type { BarChartDataset, XBand, YValue } from './types';

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
</script>

<Base svgHeight={300} let:width let:height>
  <ValueY {data} {height} {width} bind:y />

  {#if y && x}
    {#each data as { label, color, value }}
      <rect
        x={x(label)}
        width={x.bandwidth()}
        y={getY(value)}
        height={Math.abs(y(0) - y(value))}
        fill={color} />
    {/each}
  {/if}

  <IdX {data} {width} {padding} y={y?.(0) || 0} bind:x />
</Base>
