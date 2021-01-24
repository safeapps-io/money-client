<script>
  import Modal from '@/components/elements/modal.svelte';
  import BalanceCorrectionForm from '@/components/transaction/form/balanceCorrection.svelte';

  import { _ } from 'svelte-i18n';

  export let active: boolean,
    oldBalance: number | undefined = 0;

  const close = () => (active = false);
</script>

<Modal bind:active>
  <h1 class="title">{$_('cmps.transaction.correction.header')}</h1>
  <BalanceCorrectionForm on:success={close} balance={oldBalance}>
    <button class="button is-success is-outlined" slot="left">{$_('common.form.set')}</button>
    <button class="button is-outlined is-danger" type="button" on:click={close} slot="right">
      {$_('common.form.cancel')}
    </button>
  </BalanceCorrectionForm>
</Modal>
