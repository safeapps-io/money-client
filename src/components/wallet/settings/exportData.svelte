<script>
  import { _ } from 'svelte-i18n';

  import { exportAll } from '$core/export/exportAll';

  import { transactionSortedByDatetimeStore } from '$stores/decr/transaction';
  import { currentWalletCategoryStore } from '$stores/decr/category';
  import { currentWalletUserStore } from '$stores/decr/walletUser';

  let dataToSave: string | null = null,
    ref: HTMLAnchorElement | undefined;

  $: if (ref) {
    ref.click();
    dataToSave = null;
  }

  const click = () =>
    (dataToSave = exportAll(
      $transactionSortedByDatetimeStore,
      $currentWalletCategoryStore,
      $currentWalletUserStore,
    ));
</script>

{#if dataToSave}
  <a
    style="display: none"
    href={`data:text/plain;charset=utf-8,${encodeURIComponent(dataToSave)}`}
    download="export.csv"
    bind:this={ref}>_</a>
{/if}

<button class="button" on:click={click}>{$_('cmps.export.cta')}</button>
