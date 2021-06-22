<script>
  import type { DateData, XTime } from '../types';

  import Gridlines from './gridlines.svelte';

  import { min, max } from 'date-fns/esm';

  import { scaleUtc, axisBottom, setAxis } from '../common';

  export let rangeMax: number,
    gridSize: number,
    heightTranslate: number = 0,
    gridDirection: 'bottom' | 'left';

  export let ticks = 6;

  export let data: DateData[];
  $: dateArr = data.map(d => d.date);

  $: minDate = min(dateArr);
  $: maxDate = max(dateArr);

  export let scale: XTime | undefined = undefined;

  $: scale = scaleUtc().domain([minDate, maxDate]).range([0, rangeMax]);
  $: axis = axisBottom(scale!).ticks(ticks);
</script>

<g class="axis" transform="translate(0, {heightTranslate})" use:setAxis={axis} />
<Gridlines axisData={scale} direction={gridDirection} size={gridSize} {ticks} />
