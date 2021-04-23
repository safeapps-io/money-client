<script>
  import { Form, Field, TextInput } from '$strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { inputFormatDate } from '$utils/date';

  import { ensureNumber, ensureDate, dateIsAfter, dateIsBefore } from '$validators';
  import { referenceTransactionAdd } from '$stores/decr/referenceTransaction';
  import { defaultAssetStore } from '$stores/decr/asset';

  export let walletId: string;

  const dispatch = createEventDispatcher(),
    success = async ({ amount, datetime }: { amount: number; datetime: number }) => {
      const ent = await referenceTransactionAdd(walletId, {
        assetId: $defaultAssetStore.id,
        amount,
        datetime,
      });
      dispatch('success', ent);
    },
    balanceField = {
      label: $_('cmps.transaction.correction.new'),
      name: 'amount',
      clean: [ensureNumber],
      required: true,
    },
    datetimeField = {
      name: 'datetime',
      inputValue: inputFormatDate(new Date()),
      label: $_('cmps.transaction.common.date'),
      required: true,
      clean: [ensureDate],
      validate: [dateIsAfter(new Date(0)), dateIsBefore(new Date())],
    };
</script>

<Form planLimit {success}>
  <Field field={balanceField}>
    <TextInput type="number" placeholder="120 319.89" />
  </Field>
  <Field field={datetimeField}>
    <TextInput type="date" />
  </Field>
  <div class="is-flex space-between" slot="submit">
    <button class="button is-success is-outlined">{$_('common.form.save')}</button>
    <button class="button is-danger is-outlined" type="button" on:click={() => dispatch('cancel')}>
      {$_('common.form.cancel')}
    </button>
  </div>
</Form>
