<script>
  import type { LabelBasedData, XBand } from '../types';

  import { scaleBand, axisBottom, setAxis } from '../common';

  export let width: number, y: number, padding: number;

  export let data: LabelBasedData[];

  export let x: XBand | undefined = undefined;

  $: x = scaleBand()
    .domain(data.map(d => d.label))
    .range([0, width])
    .paddingInner(padding)
    .paddingOuter(padding);
  $: axisX = axisBottom(x!);
</script>

<g transform="translate(0, {y})" use:setAxis={axisX} />
