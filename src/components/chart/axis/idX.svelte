<script>
  import type { IdBasedData, XBand } from '../types';

  import { scaleBand, axisBottom, setAxis } from '../common';

  export let width: number, y: number, padding: number;

  export let data: IdBasedData[];

  export let x: XBand | undefined = undefined;

  $: x = scaleBand()
    .domain(data.map(d => d.id))
    .range([0, width])
    .paddingInner(padding)
    .paddingOuter(padding);
  $: axisX = axisBottom(x!).tickFormat((_, i) => data[i].label || data[i].id);
</script>

<g transform="translate(0, {y})" use:setAxis={axisX} />
