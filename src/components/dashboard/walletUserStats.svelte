<script>
  import BarChart from '$components/chart/bar.svelte';

  import { defaultAssetStore } from '$stores/decr/asset';
  import { currentWalletUserStore } from '$stores/decr/walletUser';

  import { moneyFormat } from '$utils/number';

  export let stats: { id: string; value: number }[] | undefined;

  $: data = stats?.map(({ id, value }) => {
    const { color, name } = $currentWalletUserStore[id].decr;
    return { id, value, color, label: name };
  });

  $: displayValue = (val: number) => $moneyFormat(val, $defaultAssetStore.decr.code);
</script>

{#if data?.length}<BarChart {data} {displayValue} />{/if}
