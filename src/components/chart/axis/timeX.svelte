<script>
  import type { DateData, XTime } from '../types';

  import Gridlines from './gridlines.svelte';

  import { min, max } from 'date-fns';

  import { scaleUtc, axisBottom, setAxis } from '../common';

  export let width: number, height: number, y: number;

  export let ticks = 6;

  export let data: DateData[];
  $: dateArr = data.map(d => d.date);

  $: minDate = min(dateArr);
  $: maxDate = max(dateArr);

  export let x: XTime | undefined = undefined;

  $: x = scaleUtc().domain([minDate, maxDate]).range([0, width]);
  $: axisX = axisBottom(x!).ticks(ticks);
</script>

<g class="axis" transform="translate(0, {y})" use:setAxis={axisX} />
<Gridlines axisData={x} direction="bottom" size={height} {ticks} />
