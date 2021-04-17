<script>
  import type { FullEntity, CorrectionTransaction } from '$stores/decr/types';

  import Level from '$components/elements/level.svelte';
  import WalletField from '$components/wallet/walletField.svelte';
  import DeleteEntityButton from '$components/elements/deleteEntityButton.svelte';
  import { Field, Form, TextInput } from '$strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { inputFormatDate } from '$utils/date';

  import { ensureDate, dateIsAfter, dateIsBefore, ensureNumber } from '$validators';
  import { selectedWalletStore } from '$stores/wallet';
  import { userEncrStore } from '$stores/user';
  import {
    correctionTransactionUpdate,
    correctionTransactionAdd,
  } from '$stores/decr/correctionTransaction';
  import { defaultAssetStore } from '$stores/decr/asset';

  /**
   * This form can create a new balance correction and can edit a pre-existing correction.
   */
  export let balance: number | undefined = undefined,
    ent: FullEntity<CorrectionTransaction> | undefined = undefined;

  const dispatch = createEventDispatcher();

  $: amountField = {
    label: ent ? $_('cmps.transaction.common.amount') : $_('cmps.transaction.correction.new'),
    name: 'amount',
    inputValue: ent ? Math.abs(ent.decr.amount) : balance,
    clean: [ensureNumber],
    required: true,
  };
  $: datetimeField = {
    name: 'datetime',
    inputValue: inputFormatDate(ent ? ent.decr.datetime : new Date()),
    label: $_('cmps.transaction.common.date'),
    required: true,
    clean: [ensureDate],
    validate: [dateIsAfter(new Date(0)), dateIsBefore(new Date())],
  };

  const success = async ({
    walletId,
    ...data
  }: {
    walletId?: string;
    amount: number;
    datetime: number;
  }) => {
    const newEnt = await (ent
      ? correctionTransactionUpdate({ ent, decr: { ...ent.decr, ...data } })
      : correctionTransactionAdd(walletId || $selectedWalletStore!, {
          ...data,
          assetId: $defaultAssetStore.id,
          amount: data.amount - balance!,
          userId: $userEncrStore!.id,
        }));

    dispatch('success', newEnt);
  };
</script>

<Form {success}>
  <WalletField walletId={ent ? ent.walletId : undefined} />

  <Field field={amountField}>
    <TextInput type="number" placeholder="120 319.89" />
  </Field>
  <Field field={datetimeField}>
    <TextInput type="date" />
  </Field>
  <Level slot="submit">
    <div class="column is-narrow" slot="left">
      <slot name="left">
        <button class="button is-success is-outlined"
          >{ent ? $_('common.form.update') : $_('common.form.create')}</button>
      </slot>
    </div>
    <div class="column is-narrow" slot="right">
      <slot name="right">
        {#if ent}
          <DeleteEntityButton entityMap={{ [ent.walletId]: [ent.id] }} on:delete />
        {/if}
      </slot>
    </div>
  </Level>
</Form>
