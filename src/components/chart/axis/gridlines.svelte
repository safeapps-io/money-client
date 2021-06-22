<script>
  import type { XTime, YValue } from '../types';

  import { axisBottom, axisLeft, setAxis } from '../common';

  export let axisData: XTime | YValue | undefined = undefined,
    direction: 'bottom' | 'left',
    size: number;

  export let ticks: number;

  $: axis = (direction == 'bottom' ? axisBottom : axisLeft)(axisData!)
    .tickSize(-size)
    .tickFormat(() => '')
    .ticks(ticks);

  $: translate = direction == 'bottom' ? `0, ${size}` : `0, 0`;
</script>

<g class="grid" transform="translate({translate})" use:setAxis={axis} />

<style lang="scss">
  .grid {
    :global(line) {
      stroke: lightgrey;
      stroke-opacity: 0.7;
      shape-rendering: crispEdges;
    }

    :global(path) {
      stroke-width: 0;
    }
  }
</style>
