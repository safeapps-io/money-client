<script>
  import type { JointWallet } from '@/stores/decr/types';

  import { Form, FieldContext, NameField, TagsField } from '@/components/strict/index';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { uniqueOnly, ensureArray, maxArrLength, minArrLength } from '@/core/strict/array';
  import { walletDataStore } from '@/stores/decr/wallet';
  import { assetStore } from '@/stores/decr/asset';
  import { addJointWallet, updateJointWallet } from '@/stores/decr/user';

  export let ent: JointWallet | undefined = undefined,
    notificationText: string | undefined = undefined;

  $: formDisabled = Object.keys($walletDataStore).length < 2;

  const getCurrencyByWalletId = (walletId: string) =>
      Object.values($assetStore[walletId] || {})[0].decr.code,
    consistentCurrency = (walletIds: string[]) => {
      let prevCurrency: string = '';

      for (const walletId of walletIds) {
        const thisCurrency = getCurrencyByWalletId(walletId);
        if (!prevCurrency) prevCurrency = thisCurrency;
        if (prevCurrency != thisCurrency) return $_('cmps.wallet.form.singleCurrencyError');
      }
    };

  $: field = {
    name: 'walletIds',
    inputValue: ent?.walletIds,
    label: $_('cmps.wallet.common.wallets'),
    choices: Object.values($walletDataStore).map(wd => ({
      value: wd.walletId,
      label: wd.decr.name,
    })),
    required: true,
    clean: [ensureArray, uniqueOnly],
    validate: [minArrLength(2), maxArrLength(50), consistentCurrency],
  };

  const dispatch = createEventDispatcher(),
    success = async (data: { name: string; walletIds: string[] }) => {
      if (ent) {
        await updateJointWallet({ id: ent.id, ...data });
      } else {
        const ent = await addJointWallet(data);
        dispatch('created', ent);
      }
    };
</script>

{#if formDisabled}
  <div class="message is-warning my-5">
    <p class="message-body">{$_('cmps.wallet.form.jointWalletsWarning')}</p>
  </div>
{:else}
  <Form
    {success}
    {notificationText}
    buttonText={ent ? $_('common.form.update') : $_('common.form.create')}>
    <NameField inputValue={ent ? ent.name : undefined} />

    <div class="mb-5">
      <FieldContext {field}>
        <TagsField />
      </FieldContext>
    </div>
  </Form>
{/if}
