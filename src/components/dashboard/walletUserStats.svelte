<script>
  import BarChart from '$components/chart/bar.svelte';
  import { currentWalletUserStore } from '$stores/decr/walletUser';

  export let stats: { id: string; value: number }[];

  $: data = stats.map(({ id, value }) => {
    const { color, name } = $currentWalletUserStore[id].decr;
    return { id, value, color, label: name };
  });
</script>

{#if data.length}<BarChart {data} />{/if}
