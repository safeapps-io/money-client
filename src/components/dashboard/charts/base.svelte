<script>
  import { getObjectHash } from '$utils/getObjectHash';

  import type { Chart } from 'chart.js';

  import { onMount, tick } from 'svelte';

  export let data: Chart.ChartData, chartSettings: Chart.ChartConfiguration, height: number;

  let canvasRef: HTMLCanvasElement | undefined, chartLib: typeof Chart, prevChart: Chart;

  onMount(async () => {
    chartLib = (await import('chart.js')).default;
  });

  let prevHash = '';
  const initChart = async (innerData: Chart.ChartData) => {
    if (!canvasRef) return;

    // Preventing empty rerenders
    const hash = await getObjectHash({ innerData, chartSettings, height });
    if (hash == prevHash) return;
    prevHash = hash;

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
