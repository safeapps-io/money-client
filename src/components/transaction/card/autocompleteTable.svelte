<script>
  import type { Transaction } from '$stores/decr/types';

  import { _ } from 'svelte-i18n';
  import { getMccDescriptionStore } from '$services/directory/directoryService';

  export let autocomplete: Transaction['autocomplete'];

  let mcc: string | null | undefined;
  $: if (autocomplete.mcc) mcc = $getMccDescriptionStore(autocomplete.mcc);
</script>

<table class="table">
  <tbody>
    {#if autocomplete.mcc}
      <tr>
        <td>{$_('cmps.transaction.form.mcc')}</td>
        <td>
          {#if typeof mcc == 'undefined'}
            {$_('cmps.nav.loading')}
          {:else if mcc}
            {mcc}
          {:else}
            {$_('cmps.transaction.form.mccUnknown')}
          {/if}
        </td>
      </tr>
    {/if}
    {#if autocomplete.merchant}
      <tr>
        <td>{$_('cmps.transaction.form.merchant')}</td>
        <td>{autocomplete.merchant}</td>
      </tr>
    {/if}
    {#if autocomplete.accountNumber}
      <tr>
        <td>{$_('cmps.transaction.form.account')}</td>
        <td>{autocomplete.accountNumber}</td>
      </tr>
    {/if}
  </tbody>
</table>

<style lang="scss">
  .table {
    font-size: 0.75rem;
    width: 100%;
  }

  td:first-child {
    font-weight: bold;
    padding-right: 0.3em;
    width: 120px;
  }
</style>
