<script>
  import type { AxisBuilder, IdBasedData, XBand } from '../types';
  import type { Axis } from 'd3-axis';

  import { scaleBand, setAxis } from '../common';

  export let rangeMax: number,
    heightTranslate = 0,
    padding: number,
    hideLabels = false;

  export let data: IdBasedData[];

  export let scale: XBand | undefined = undefined;

  export let axisBuilder: AxisBuilder;

  $: scale = scaleBand()
    .domain(data.map(d => d.id))
    .range([0, rangeMax])
    .paddingInner(padding)
    .paddingOuter(padding);
  let axis: Axis<string>;
  $: {
    axis = axisBuilder(scale!).tickFormat((_, i) =>
      hideLabels ? '' : data[i].label || data[i].id,
    );
    if (hideLabels) axis.tickSize(0);
  }
</script>

<g class="axis" transform="translate(0, {heightTranslate})" use:setAxis={axis} />
