<script>
  import type { FormStore } from '@/components/strict/base';
  import type { FullEntity, Transaction } from '@/stores/decr/types';
  import type { TransactionFieldsForm } from '@/core/transaction/setCorrectAmount';

  import Level from '@/components/elements/level.svelte';
  import { Form } from '@/components/strict';
  import TransactionFields from './fields.svelte';
  import WalletField from '@/components/wallet/walletField.svelte';
  import DeleteEntityButton from '@/components/elements/deleteEntityButton.svelte';
  import AutocompleteTable from '../card/autocompleteTable.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { selectedWalletStore } from '@/stores/wallet';
  import { transactionAdd, transactionUpdate } from '@/stores/decr/transaction';
  import { setCorrectAmount } from '@/core/transaction/setCorrectAmount';
  import { userEncrStore } from '@/stores/user';
  import { defaultWalletUserIdStore } from '@/stores/decr/walletUser';
  import { defaultAssetStore } from '@/stores/decr/asset';

  export let ent: FullEntity<Transaction> | undefined = undefined;

  const dispatch = createEventDispatcher();

  /**
   * The flow is simple: we always need to explicitly push the button "Save as draft", otherwise the transaction
   * will become a usual one and not a draft. That is why we set this flag to false by default rather then
   * use ent.isDraft value when ent is present.
   */
  let isDraft = false;

  const success = async ({ walletId, ...data }: TransactionFieldsForm) => {
    const preprocessedTr = setCorrectAmount(data),
      newEnt = await (ent
        ? transactionUpdate({
            ent,
            decr: {
              ...ent.decr,
              ...preprocessedTr,
              isDraft,
              // We intentionally update the user. It serves the purpose of
              // `latest updated by`.
              userId: $userEncrStore!.id,
            },
          })
        : transactionAdd(walletId || $selectedWalletStore!, {
            walletUserId: $defaultWalletUserIdStore,
            ...preprocessedTr,
            assetId: $defaultAssetStore.id,
            userId: $userEncrStore!.id,
            isDraft,
            autocomplete: {},
          }));

    dispatch('success', newEnt);
  };

  // For joint wallets we need to pass down selected wallet id to filter categories and users for it
  let formStore: FormStore | undefined;
  $: fieldSelectedWalletId = formStore ? $formStore.fields.walletId?.inputValue : undefined;
</script>

<Form
  {success}
  buttonText={ent ? $_('common.form.update') : $_('common.form.create')}
  bind:formStore>
  <WalletField walletId={ent?.walletId} />

  <TransactionFields
    ent={ent?.decr}
    defaultWalletUserId={$defaultWalletUserIdStore}
    walletId={fieldSelectedWalletId} />

  {#if ent?.decr.autocomplete}
    <div class="mt-5">
      <AutocompleteTable autocomplete={ent.decr.autocomplete} />
    </div>
  {/if}

  <div slot="submit" class="field mt-5" let:disabled let:loading let:buttonText>
    <Level>
      <svelte:fragment slot="left">
        <div class="column is-narrow">
          <button class="button is-success" class:is-color-loading={loading} {disabled}
            >{buttonText}</button>
        </div>
        <div class="column is-narrow">
          {#if !ent || ent.decr.isDraft}
            <div class="level-item">
              <button
                class="button is-text"
                class:is-color-loading={loading}
                {disabled}
                on:click={() => (isDraft = true)}>
                {$_('cmps.transaction.form.saveDraft')}
              </button>
            </div>
          {/if}
        </div>
      </svelte:fragment>

      <div class="column is-narrow" slot="right">
        {#if ent}
          <DeleteEntityButton entityMap={{ [ent.walletId]: [ent.id] }} on:delete />
        {/if}
      </div>
    </Level>
  </div>
</Form>
