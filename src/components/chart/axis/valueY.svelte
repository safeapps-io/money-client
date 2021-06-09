<script>
  import type { NumberData, YValue } from '../types';

  import { kFormatter } from '$utils/number';

  import { scaleLinear, axisLeft, setAxis } from '../common';
  import Gridlines from './gridlines.svelte';

  export let height: number,
    width: number,
    x = 0;

  export let ticks = 5;

  export let data: NumberData[];
  $: valueArr = data.map(d => d.value);

  let minValue: number, maxValue: number;
  $: {
    const minDataSetValue = Math.min(...valueArr);
    minValue = minDataSetValue < 0 ? minDataSetValue : 0;

    const maxDataSetValue = Math.max(...valueArr);
    maxValue = maxDataSetValue > 0 ? maxDataSetValue : 0;
  }

  export let y: YValue | undefined = undefined;

  $: y = scaleLinear().domain([maxValue, minValue]).nice().range([0, height]);
  $: axisY = axisLeft(y!).tickFormat(kFormatter).ticks(ticks);
</script>

<g class="axis" use:setAxis={axisY} />
<Gridlines axisData={y} direction="left" size={width} {ticks} />
