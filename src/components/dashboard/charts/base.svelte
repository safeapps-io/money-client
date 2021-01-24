<script>
  import type { Chart } from 'chart.js';

  import { onMount, tick } from 'svelte';

  export let data: Chart.ChartData, chartSettings: Chart.ChartConfiguration, height: number;

  let canvasRef: HTMLCanvasElement | undefined, chartLib: typeof Chart, prevChart: Chart;

  onMount(async () => {
    chartLib = (await import('chart.js')).default;
  });

  const initChart = async (innerData: Chart.ChartData) => {
    if (!canvasRef) return;
    prevChart?.destroy();

    await tick();
    prevChart = new chartLib(canvasRef, {
      ...chartSettings,
      data: innerData,
    });
  };

  $: chartLib && canvasRef && height && initChart(data);
</script>

{#key height}<canvas bind:this={canvasRef} {height} />{/key}
