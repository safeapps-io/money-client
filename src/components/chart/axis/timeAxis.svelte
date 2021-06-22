<script>
  import type { DateData, XTime } from '../types';

  import Gridlines from './gridlines.svelte';

  import { min, max, addDays } from 'date-fns/esm';

  import { scaleUtc, axisBottom, setAxis } from '../common';

  export let rangeMax: number,
    gridSize: number,
    heightTranslate: number = 0,
    gridDirection: 'bottom' | 'left';

  export let ticks = 6;

  export let data: DateData[];
  $: dateArr = data.map(d => d.date);

  let minDate: Date, maxDate: Date;

  $: if (dateArr.length == 1) {
    minDate = addDays(dateArr[0], -1);
    maxDate = addDays(dateArr[0], 1);
    ticks = 2;
  } else {
    minDate = min(dateArr);
    maxDate = max(dateArr);
  }

  export let scale: XTime | undefined = undefined;

  $: scale = scaleUtc().domain([minDate, maxDate]).range([0, rangeMax]);
  $: axis = axisBottom(scale!).ticks(ticks);
</script>

<g class="axis" transform="translate(0, {heightTranslate})" use:setAxis={axis} />
<Gridlines axisData={scale} direction={gridDirection} size={gridSize} {ticks} />
