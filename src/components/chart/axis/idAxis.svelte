<script>
  import type { AxisBuilder, IdBasedData, XBand } from '../types';

  import { scaleBand, setAxis } from '../common';

  export let rangeMax: number,
    heightTranslate = 0,
    padding: number;

  export let data: IdBasedData[];

  export let scale: XBand | undefined = undefined;

  export let axisBuilder: AxisBuilder;

  $: scale = scaleBand()
    .domain(data.map(d => d.id))
    .range([0, rangeMax])
    .paddingInner(padding)
    .paddingOuter(padding);
  $: axisX = axisBuilder(scale!).tickFormat((_, i) => data[i].label || data[i].id);
</script>

<g class="axis" transform="translate(0, {heightTranslate})" use:setAxis={axisX} />
