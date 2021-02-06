<script>
  import type { Transaction } from '@/stores/decr/types';

  import { _ } from 'svelte-i18n';
  import { getMccDescription } from '@/services/mcc/mccWsActions';

  export let autocomplete: Transaction['autocomplete'];

  $: mcc = autocomplete.mcc ? $getMccDescription(autocomplete.mcc) : null;
</script>

<table class="table">
  <tbody>
    {#if mcc}
      <tr>
        <td>{$_('cmps.transaction.form.mcc')}</td>
        <td>{mcc}</td>
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
