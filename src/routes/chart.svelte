<script>
  import type { BarChartDataset, LineChartDataset } from '$components/chart/types';

  import UnAuthLayout from '$components/nav/unAuthLayout.svelte';
  import Line from '$components/chart/line.svelte';
  import Bar from '$components/chart/bar.svelte';

  import { addDays } from 'date-fns';

  import { randBetween } from '$utils/random';
  import { generateRandomColor } from '$utils/color';

  // FIXME: delete it
  const baseDate = new Date(2020, 3, 1);
  let data: LineChartDataset = [];

  const generateLine = () => {
    data = [];
    let prevValue = 1000;
    for (let i = 0; i < 10000; i++) {
      if (Math.random() > 0.6) continue;
      prevValue += randBetween(-300, 300);
      data.push({ value: prevValue, date: addDays(baseDate, i) });
    }
  };
  generateLine();

  let barData: BarChartDataset = [];
  const generateBar = () => {
    barData = Array(Math.round(randBetween(3, 8)))
      .fill(null)
      .map((_, i) => ({
        value: randBetween(-300, 1500),
        label: `Bar ${i + 1}`,
        color: generateRandomColor(),
      }));
  };
  generateBar();

  /**
   * 1. localize ticks?
   * 2. add detailed data on each bar
   * 3. kformatter should get a max data to change toFixed() notation for max <3k (e.g)
   * 4. horizontal bars?
   */
</script>

<UnAuthLayout>
  <hr />
  <h2 class="subtitle">Bar</h2>
  <button class="button my-6" on:click={generateBar}>generate</button>
  <Bar data={barData} />

  <hr />
  <h2 class="subtitle">Line</h2>
  <button class="button my-6" on:click={generateLine}>generate</button>
  <Line {data} />
</UnAuthLayout>
