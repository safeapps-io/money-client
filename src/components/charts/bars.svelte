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
  import { tick } from 'svelte';

  export let dataset: { backgroundColor: string[]; borderColor: string[]; data: number[] },
    labels: string[],
    type = 'horizontalBar',
    height: number | undefined = undefined;

  let innerHeight = height,
    show = true;
  $: if (typeof height == 'undefined' && dataset.data) {
    show = false;

    const length = dataset.data.length || 0;
    innerHeight = length * (length < 5 ? 50 : 30);
    console.log({ height, innerHeight });

    // I just couldn't manage to force this piece of shit to maintain a certain height.
    // It was always rewritten by chart.js, this is why we cheat like this.
    tick().then(() => (show = true));
  }
</script>

<div class="py-4">
  {#if show}
    <canvas
      height={innerHeight}
      use:chartjs={{ ...chartSettings, type, data: { labels, datasets: [dataset] } }} />
  {/if}
</div>
