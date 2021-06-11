<script>
  import type { LineChartDataset, XTime, YValue } from '../types';

  import { bisector, pointer } from '../common';

  export let width: number, height: number;

  let mousePosition: { x?: number; y?: number } = {};

  const mouseOut = () => (mousePosition = {}),
    mouseMove = (e: MouseEvent) => {
      const [x, y] = pointer(e);
      mousePosition = { x, y };
    };

  export let x: XTime | undefined, y: YValue | undefined, data: LineChartDataset;

  export let focusPoint: null | ArrayItem<LineChartDataset> = null;
  let fixedPosition = false;

  const bisect = bisector((val: ArrayItem<LineChartDataset>) => val.date);
  const calcFocusPointPosition = (xCoord: number) => {
    if (!x || !y) return;

    const x0 = x.invert(xCoord),
      i = bisect.right(data, x0),
      d0 = data[i - 1],
      d1 = data[i];

    if (!d0 || !d1) return;

    focusPoint = x0.getTime() - d0.date.getTime() > d1.date.getTime() - x0.getTime() ? d1 : d0;
  };

  $: if (!fixedPosition) {
    if (mousePosition?.x) calcFocusPointPosition(mousePosition.x);
    else focusPoint = null;
  }

  // Resetting the focus point once data changes
  $: if (data) {
    fixedPosition = false;
    focusPoint = null;
  }
  export let xVal: number | null = null,
    yVal: number | null = null;
  $: xVal = x && focusPoint ? x(focusPoint.date) : null;
  $: yVal = y && focusPoint ? y(focusPoint.value) : null;
</script>

<rect
  x="0"
  y="0"
  fill="none"
  pointer-events="all"
  {width}
  {height}
  on:click={() => (fixedPosition = !fixedPosition)}
  on:mouseout={mouseOut}
  on:mousemove={mouseMove} />
