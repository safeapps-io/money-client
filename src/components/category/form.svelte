<script>
  import type { FullEntity, Category } from '$stores/decr/types';

  import Level from '$components/elements/level.svelte';
  import { Form, NameField, ColorField } from '$strict';
  import WalletField from '$components/wallet/walletField.svelte';
  import DeleteEntityButton from '$components/elements/deleteEntityButton.svelte';
  import CategorySwitchModal from './categorySwitchModal.svelte';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { selectedWalletStore } from '$stores/wallet';
  import { categoryAdd, categoryUpdate } from '$stores/decr/category';

  export let ent = undefined as FullEntity<Category> | undefined,
    isIncomeCategory: boolean = false;

  const dispatch = createEventDispatcher();

  $: isIncome = ent?.decr.isIncome ?? isIncomeCategory;

  const success = async ({
    walletId,
    ...data
  }: {
    name: string;
    color: string;
    walletId?: string;
  }) => {
    const newEnt: FullEntity<Category> = await (ent
      ? categoryUpdate({ ent, decr: { ...ent.decr, ...data } })
      : categoryAdd(walletId || $selectedWalletStore!, { ...data, isIncome }));
    dispatch('success', newEnt);
  };

  let resolve: ((result: boolean) => void) | undefined = undefined,
    showCategorySwitch = false;
  const offerCategorySwitch = () =>
      new Promise<boolean>(innerResolve => {
        showCategorySwitch = true;
        resolve = innerResolve;
      }),
    launchDelete = () => (resolve?.(true), (showCategorySwitch = false), (resolve = undefined));

  // If for some reason the modal is closed and `resolve` is set, we think, that user
  // canceled the process alltogether
  $: !showCategorySwitch && typeof resolve !== 'undefined' && resolve(false);
</script>

{#if ent}
  <CategorySwitchModal {ent} bind:active={showCategorySwitch} on:delete={launchDelete} />
{/if}

<Form buttonText={ent ? $_('common.form.update') : $_('common.form.create')} {success}>
  <WalletField walletId={ent?.walletId} />

  <NameField inputValue={ent?.decr.name} placeholder={$_('cmps.category.namePlaceholder')} />

  <ColorField inputValue={ent?.decr.color} />

  <Level slot="submit" let:buttonText>
    <div class="column is-narrow" slot="left">
      <button class="button is-success">{buttonText}</button>
    </div>
    <div class="column is-narrow" slot="right">
      {#if ent}
        <DeleteEntityButton
          entityMap={{ [ent.walletId]: [ent.id] }}
          runBefore={offerCategorySwitch}
          on:delete />
      {/if}
    </div>
  </Level>
</Form>
