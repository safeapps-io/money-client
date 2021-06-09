<script>
  import type { LineChartDataset, XTime, YValue } from './types';

  import { fillBlankDate, line, setLine } from './common';

  import Base from './base.svelte';
  import TimeX from './axis/timeX.svelte';
  import ValueY from './axis/valueY.svelte';

  export let data: LineChartDataset;
  $: filledBlanks = fillBlankDate(data);

  let y: YValue, x: XTime;

  $: getLine = line<ArrayItem<LineChartDataset>>()
    .x(d => x?.(d.date))
    .y(d => y?.(d.value));
</script>

<Base svgHeight={300} let:width let:height>
  <ValueY {data} {height} {width} bind:y />
  <TimeX {data} {width} {height} y={y?.(0)} bind:x />

  <g use:setLine={{ getLine, data: filledBlanks }} />
</Base>
