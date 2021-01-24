<script>
  import type {
    Category,
    FullEntity,
    OmitCommonFields,
    Transaction,
    WalletUser,
  } from '@/stores/decr/types';

  import CrossfadeWrapper from '@/components/elements/crossfadeWrapper.svelte';
  import ParsedTransactionData from './parsedTransactionData.svelte';
  import SubmitButtons from './submitButtons.svelte';
  import ZeroData from '@/components/elements/zeroData.svelte';
  import { Onboarding, Text } from '@/components/onboarding/index';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { CsvParsedTransactionResolution } from '@/core/csv/constants';

  const dispatch = createEventDispatcher();

  export let transactionToResolve: OmitCommonFields<Transaction> | undefined,
    suggestedCategoryIds: string[] | undefined,
    category: FullEntity<Category> | undefined = undefined,
    walletUser: FullEntity<WalletUser> | undefined = undefined,
    showOnboarding = false;

  let submitDisabled = false,
    showEdit: boolean,
    resolution: CsvParsedTransactionResolution;

  const submit = ({ detail: innerResolution }: CustomEvent<CsvParsedTransactionResolution>) => {
      resolution = innerResolution;
      dispatch('triggerManualSubmit', resolution);
    },
    success = ({ detail }: CustomEvent<OmitCommonFields<Transaction>>) =>
      dispatch('success', { transaction: detail, resolution });

  type OnboardingSteps = 'card' | 'submit';
  let currentStep: OnboardingSteps = 'card';
</script>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    place-items: center;

    padding: 1em;
  }
</style>

{#if transactionToResolve}
  <div class="wrapper">
    <Onboarding preventSlotClick bottom shouldShow={showOnboarding && currentStep == 'submit'}>
      <div class="mb-5">
        <SubmitButtons {submitDisabled} on:submit={submit} />
      </div>

      <div slot="text">
        <Text>{$_('cmps.csv.queue.onboarding.saveTransactions')}</Text>
        <button
          class="button mt-3"
          on:click={() => dispatch('onboardingFinish')}>{$_('common.allClear')}</button>
      </div>
    </Onboarding>

    <CrossfadeWrapper replayAnimationKey={JSON.stringify(transactionToResolve)}>
      <Onboarding preventSlotClick shouldShow={showOnboarding && currentStep == 'card'}>
        <div class="box" class:box--hoverable={!showEdit} class:my-4={showEdit}>
          <ParsedTransactionData
            {suggestedCategoryIds}
            {category}
            {walletUser}
            transaction={transactionToResolve}
            bind:submitDisabled
            bind:showEdit
            on:success={success} />
        </div>
        <div slot="text">
          <Text header>{$_('cmps.csv.queue.onboarding.parsed.header')}</Text>
          <Text>{$_('cmps.csv.queue.onboarding.parsed.main')}</Text>
          <button
            class="button mt-3"
            on:click={() => (currentStep = 'submit')}>{$_('common.form.ok')}</button>
        </div>
      </Onboarding>
    </CrossfadeWrapper>
  </div>
{:else}
  <div>
    <ZeroData text={$_('cmps.csv.queue.zeroData') + ' 👍'} />
  </div>
{/if}
