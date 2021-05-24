<script context="module">
  export type Dataset = { backgroundColor: string[]; borderColor: string[]; data: number[] };

  const chartSettings = {
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

<script>
  import { chartjs } from '$utils/actions/chartjs';

  export let dataset: { backgroundColor: string[]; borderColor: string[]; data: number[] },
    labels: string[],
    type = 'horizontalBar',
    height: number | undefined = undefined;

  $: if (!height) {
    if (dataset.data?.length < 5) height = (dataset.data.length || 0) * 50;
    else height = (dataset.data?.length || 0) * 30;
  }
</script>

<div class="py-4">
  {#key height}<canvas
      {height}
      use:chartjs={{ ...chartSettings, type, data: { labels, datasets: [dataset] } }} />{/key}
</div>
