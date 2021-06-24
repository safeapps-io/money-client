<script>
  import { _ } from 'svelte-i18n';

  import { exportAll } from '$core/export/exportAll';

  import { transactionSortedByDatetimeStore } from '$stores/decr/transaction';
  import { currentWalletCategoryStore } from '$stores/decr/category';
  import { currentWalletUserStore } from '$stores/decr/walletUser';

  let dataToSave: string | null = null,
    loading = false,
    ref: HTMLAnchorElement | undefined;

  $: if (ref) {
    ref.click();
    dataToSave = null;
    loading = false;
  }

  const click = async () => {
    loading = true;
    // Otherwise some browsers lag and block the UI without any valid reason. This way
    // we always have some feedback for the user.
    setTimeout(
      () =>
        (dataToSave = exportAll(
          $transactionSortedByDatetimeStore,
          $currentWalletCategoryStore,
          $currentWalletUserStore,
        )),
      500,
    );
  };
</script>

{#if dataToSave}
  <a
    style="display: none"
    href={`data:text/plain;charset=utf-8,${encodeURIComponent(dataToSave)}`}
    download="export.csv"
    bind:this={ref}>_</a>
{/if}

<button class="button" class:is-color-loading={loading} on:click={click}
  >{$_('cmps.export.cta')}</button>
