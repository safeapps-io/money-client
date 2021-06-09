<script>
  import UnAuthLayout from '$components/nav/unAuthLayout.svelte';

  import Line from '$components/chart/line.svelte';
  import type { LineChartDataset } from '$components/chart/types';
  import { addDays } from 'date-fns';
  import { randBetween } from '$utils/random';

  // FIXME: delete it

  const baseDate = new Date(2020, 3, 1);
  let data: LineChartDataset = [];

  const generate = () => {
    data = [];
    let prevValue = -400;
    for (let i = 0; i < 100; i++) {
      if (Math.random() > 0.6) continue;
      prevValue += randBetween(-200, 300);
      data.push({ value: prevValue, date: addDays(baseDate, i) });
    }
  };
  generate();
</script>

<UnAuthLayout>
  <button class="button my-6" on:click={generate}>generate</button>

  <Line {data} />
</UnAuthLayout>
