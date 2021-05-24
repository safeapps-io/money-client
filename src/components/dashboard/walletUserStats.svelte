<script>
  import type { Dataset } from '$components/charts/bars.svelte';

  import BarChart from '$components/charts/bars.svelte';
  import { currentWalletUserStore } from '$stores/decr/walletUser';

  export let stats: { id: string; value: number }[];

  let dataset: Dataset | undefined, labels: string[] | undefined;
  const pushToDataset = (value: number, color: string, name: string) => {
    if (!dataset || !labels) return;
    dataset.data.push(value);
    dataset.backgroundColor.push(color);
    dataset.borderColor.push(color);
    labels.push(name);
  };
  $: {
    dataset = { backgroundColor: [], borderColor: [], data: [] };
    labels = [];

    const coveredIds: string[] = [];
    for (const { id, value } of stats) {
      const { color, name } = $currentWalletUserStore[id].decr;
      coveredIds.push(id);
      pushToDataset(value, color, name);
    }

    for (const { id, decr } of Object.values($currentWalletUserStore)) {
      if (!coveredIds.includes(id)) pushToDataset(0.00001, decr.color, decr.name);
    }
  }
</script>

{#if dataset && labels}<BarChart type="bar" height={200} {labels} {dataset} />{/if}
