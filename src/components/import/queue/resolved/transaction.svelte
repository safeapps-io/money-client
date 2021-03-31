<script>
  import type {
    Category,
    FullEntity,
    OmitCommonFields,
    Transaction,
    WalletUser,
  } from '$stores/decr/types';
  import type { TransactionFieldsForm } from '$core/transaction/setCorrectAmount';

  import { createEventDispatcher } from 'svelte';

  import ParsedTransactionData from '../parsedTransactionData.svelte';
  import SubmitButtons from '../submitButtons.svelte';

  import { CsvParsedTransactionResolution } from '$core/import/constants';

  const dispatch = createEventDispatcher();

  export let transaction: OmitCommonFields<Transaction>,
    defaultWalletUserId: string,
    showDelimiter: boolean,
    category: FullEntity<Category> | undefined = undefined,
    walletUser: FullEntity<WalletUser> | undefined = undefined;

  let showEdit: boolean,
    resolution: CsvParsedTransactionResolution | undefined,
    trCmp: ParsedTransactionData | undefined;

  const hideForm = () => trCmp?.hideForm(),
    submit = ({ detail }: CustomEvent<CsvParsedTransactionResolution>) => (resolution = detail),
    success = ({ detail }: CustomEvent<TransactionFieldsForm>) => {
      hideForm();
      dispatch('success', { transaction: detail, resolution });
    };
</script>

<div
  class="wrapper"
  class:box={showEdit}
  class:box--hoverable={!showEdit}
  class:hide-all-borders={showEdit}
  class:my-6={showEdit}
  class:p-4={showEdit}
  class:hide-delimiter={!showDelimiter}>
  <ParsedTransactionData
    hideTable
    {transaction}
    {category}
    {walletUser}
    {defaultWalletUserId}
    bind:showEdit
    bind:this={trCmp}
    on:success={success}>
    <div class="submit mt-6" slot="submit" let:submitDisabled>
      <SubmitButtons
        typeSubmit
        addCancel
        {submitDisabled}
        on:cancel={hideForm}
        on:submit={submit} />
    </div>
  </ParsedTransactionData>
</div>

<style lang="scss">
  .hide-all-borders {
    border-color: transparent !important;
  }

  .hide-delimiter {
    border-top-color: transparent !important;
  }

  .wrapper {
    padding: 0.4em;

    border-top: 1px dotted var(--delimiterColor);
    border-left: var(--categoryBorder);
    background-color: $scheme-main;

    transition: margin, padding, box-shadow, border-color, border, transform 0.3s ease-in-out;
  }

  .submit {
    display: flex;
    flex-direction: column;
    place-items: center;
  }
</style>
