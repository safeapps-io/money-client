<script>
  import type { AxisBuilder, NumberData, YValue } from '../types';

  import { kFormatter } from '$utils/number';

  import { scaleLinear, setAxis } from '../common';
  import Gridlines from './gridlines.svelte';

  export let rangeMax: number,
    heightTranslate = 0,
    domainOrder: 'usual' | 'reversed' = 'reversed',
    gridSize: number,
    gridDirection: 'bottom' | 'left';

  export let ticks = 5;

  export let data: NumberData[];
  $: valueArr = data.map(d => d.value);

  let minValue: number, maxValue: number, allMax: number;
  $: {
    const minDataSetValue = Math.min(...valueArr);
    minValue = minDataSetValue < 0 ? minDataSetValue * 0.9 : 0;

    const maxDataSetValue = Math.max(...valueArr);
    maxValue = maxDataSetValue > 0 ? maxDataSetValue * 1.1 : 0;

    allMax = Math.max(Math.abs(minValue), Math.abs(maxValue));
  }

  export let scale: YValue | undefined = undefined;

  export let axisBuilder: AxisBuilder;

  $: scale = scaleLinear()
    .domain(domainOrder == 'usual' ? [minValue, maxValue] : [maxValue, minValue])
    .range([0, rangeMax])
    .nice();
  $: axis = axisBuilder(scale!)
    .tickFormat(val => kFormatter(val, allMax))
    .ticks(ticks);
</script>

<g class="axis" transform="translate(0, {heightTranslate})" use:setAxis={axis} />
<Gridlines axisData={scale} direction={gridDirection} size={gridSize} {ticks} />
