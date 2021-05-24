<script context="module">
  const color = 'hsl(141, 53%,  53%)';

  const commonDatasetSettings = {
    fill: false,
    lineTension: 0.1,
    backgroundColor: 'rgba(255,147,5,0.4)',
    borderColor: color,
    pointBorderColor: color,
    pointBackgroundColor: '#fff',
    pointHoverRadius: 5,
    pointHoverBackgroundColor: color,
    pointHoverBorderColor: 'rgba(220,220,220,1)',
    pointHoverBorderWidth: 2,
    pointRadius: 1,
    pointHitRadius: 5,
    spanGaps: true,
  };

  const chartSettings = {
    type: 'line',
    options: {
      responsive: true,
      legend: {
        display: false,
      },
      scales: {
        xAxes: [
          {
            type: 'time',
            time: {
              unit: 'day' as any,
            },
          },
        ],
      },
    },
  };
</script>

<script>
  import { chartjs } from '$utils/actions/chartjs';

  export let data: { y: number; t: Date }[], label: string;

  $: datasets = [{ ...commonDatasetSettings, label, data }];
</script>

<canvas height="150" use:chartjs={{ ...chartSettings, data: { datasets } }} />
