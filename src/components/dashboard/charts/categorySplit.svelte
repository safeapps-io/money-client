<script>
  import type { ChartDataSets } from 'chart.js';

  import Base from './base.svelte';

  export let dataset: ChartDataSets, labels: string[];

  $: height = (dataset.data?.length || 0) * 30;

  const chartSettings = {
    type: 'horizontalBar',
    options: {
      responsive: true,
      legend: {
        display: false,
      },
      scales: {
        yAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
        xAxes: [
          {
            ticks: {
              beginAtZero: true,
            },
          },
        ],
      },
    },
  };
</script>

<div class="py-4">
  <Base {height} {chartSettings} data={{ labels, datasets: [dataset] }} />
</div>
