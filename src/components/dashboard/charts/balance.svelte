<script>
  import type { ChartConfiguration } from 'chart.js';
  import BaseChart from './base.svelte';

  import { _ } from 'svelte-i18n';

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

  export let data: { y: number; t: Date }[];

  $: datasets = [
    {
      label: $_('cmps.dashboard.balanceChart'),
      data,
      ...commonDatasetSettings,
    },
  ];

  const chartSettings: ChartConfiguration = {
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
              unit: 'day',
            },
          },
        ],
      },
    },
  };
</script>

<BaseChart height={150} {chartSettings} data={{ datasets }} />
