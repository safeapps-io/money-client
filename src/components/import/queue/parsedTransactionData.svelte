<script context="module">
  import { writable } from 'svelte/store';

  // Making sure only one transaction can show a form at once
  const componentIdWithEditStatus = writable(null as number | null);
</script>

<script>
  import type {
    Category,
    FullEntity,
    OmitCommonFields,
    Transaction,
    WalletUser,
  } from '$stores/decr/types';
  import type { FormStore } from '$strict/base';
  import type { TransactionFieldsForm } from '$core/transaction/setCorrectAmount';

  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';

  import TransactionFields from '$components/transaction/form/fields.svelte';
  import AutocompleteTable from '$components/transaction/card/autocompleteTable.svelte';
  import TransactionCard from '$components/transaction/card/transactionCard.svelte';
  import { Form } from '$strict';

  import { setCorrectAmount } from '$core/transaction/setCorrectAmount';

  const dispatch = createEventDispatcher();

  export let transaction: OmitCommonFields<Transaction>,
    defaultWalletUserId: string,
    submitDisabled: boolean = false,
    category: FullEntity<Category> | undefined = undefined,
    walletUser: FullEntity<WalletUser> | undefined = undefined,
    suggestedCategoryIds: string[] | undefined = undefined,
    hideTable = false;

  const componentId = Math.random();
  // Resetting edit status in case transaction is reactively changed within the same component
  $: transaction && ($componentIdWithEditStatus = null);

  // Shouldn't be tampered directly, only through exported setter functions
  export let showEdit = false;
  $: showEdit = $componentIdWithEditStatus == componentId;
  export const hideForm = () => ($componentIdWithEditStatus = null),
    showForm = () => !showEdit && ($componentIdWithEditStatus = componentId);

  $: showTable =
    showEdit ||
    (!hideTable &&
      (transaction.autocomplete.mcc ||
        transaction.autocomplete.merchant ||
        transaction.autocomplete.accountNumber));

  let formStore: FormStore | undefined;
  $: formStore && (submitDisabled = $formStore.submitDisabled);

  const success = ({ detail }: CustomEvent<TransactionFieldsForm>) =>
    dispatch('success', { ...transaction, ...setCorrectAmount(detail) });
</script>

<div class:clickable={!showEdit}>
  {#if showEdit}
    <div class="py-3" transition:slide|local>
      <Form planLimit showSubmit={false} bind:formStore on:success={success}>
        <TransactionFields {defaultWalletUserId} {suggestedCategoryIds} ent={transaction} />
        <!-- 
          When used in unresolved.svelte, we pass no slot here and trigger submit from main.svelte.
          When used in transactionList.svelte, we pass buttons here and trigger submit from them.
         -->
        <slot name="submit" {submitDisabled}><button type="submit" style="display: none" /></slot>
      </Form>
    </div>
  {:else}
    <div transition:slide|local on:click={showForm}>
      <TransactionCard {transaction} {walletUser} {category} />
    </div>
  {/if}
  {#if showTable}
    <div on:click={showForm}>
      <hr />
      <AutocompleteTable autocomplete={transaction.autocomplete} />
    </div>
  {/if}
</div>
