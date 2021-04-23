<script>
  import type { WalletData, FullEntity } from '$stores/decr/types';

  import { Form, Field, NameField, TextInput, SelectInput, CheckboxInput } from '$strict';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { ensureString, trim, minLength } from '$validators';
  import { WalletService } from '$services/wallet/walletService';
  import { currencyListStore } from '$services/directory/directoryService';
  import { walletDataUpdate } from '$stores/decr/wallet';
  import { userEncrStore } from '$stores/user';
  import { defaultAssetStore } from '$stores/decr/asset';
  import { categoryBulkAdd } from '$stores/decr/category';
  import { categoriesFromMetaCategoriesStore } from '$stores/metaCategory';

  export let ent: FullEntity<WalletData> | undefined = undefined,
    notificationText: string | undefined = undefined,
    alwaysCreateDefaultCategories = false;

  $: currencyChoices = $currencyListStore
    ? $currencyListStore!.map(({ code, label }) => ({ label: `${code} — ${label}`, value: code }))
    : [];
  $: currencyField = {
    name: 'currency',
    label: $_('cmps.wallet.form.currency'),
    clean: [ensureString, trim],
    loading: !currencyChoices.length,
    choices: currencyChoices,
    validate: [minLength()],
  };

  const dispatch = createEventDispatcher(),
    success = async ({
      name,
      currency,
      addCategories,
    }: {
      name: string;
      currency: string;
      addCategories?: boolean;
    }) => {
      if (ent) {
        await walletDataUpdate({ ent, decr: { ...ent.decr, name } });
      } else {
        const created = await WalletService.create({
          walletName: name,
          username: $userEncrStore!.username,
          assetCode: currency,
        });
        if (alwaysCreateDefaultCategories || addCategories)
          await categoryBulkAdd(created.id, $categoriesFromMetaCategoriesStore);

        dispatch('created', created);
      }
    };
</script>

<Form
  planLimit
  {success}
  {notificationText}
  buttonText={ent ? $_('common.form.update') : $_('common.form.create')}>
  <NameField inputValue={ent?.decr.name} />

  {#if ent}
    <Field
      field={{
        name: 'currency',
        label: $_('cmps.wallet.form.currency'),
        inputValue: $defaultAssetStore?.decr.code,
      }}>
      <TextInput readonly={true} />
    </Field>
  {:else}
    <Field field={currencyField}>
      <SelectInput />
    </Field>
    {#if !alwaysCreateDefaultCategories}
      <div class="my-5">
        <Field
          field={{
            name: 'addCategories',
            label: $_('cmps.wallet.form.defCategories'),
            inputValue: true,
          }}>
          <CheckboxInput />
        </Field>
      </div>
    {/if}
  {/if}
</Form>
