<script>
  import type { ParsedTransaction } from '$core/import/types';
  import type { OmitCommonFields, Transaction } from '$stores/decr/types';

  import { Onboarding, Text } from '$components/onboarding';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import Tabs from '$components/elements/tabs.svelte';
  import Unresolved from './unresolved.svelte';
  import AutomationSettings from './automationSettings.svelte';
  import ResolvedTransactionList from './resolved/transactionList.svelte';
  import ResolvedAutoTransactionList from './resolved/autoTransactionList.svelte';
  import Troubleshoot from '$components/elements/dropdown/troubleshoot.svelte';

  import { _ } from 'svelte-i18n';
  import { media } from 'svelte-match-media';
  import { createEventDispatcher, tick } from 'svelte';
  import arrowRightIcon from 'teenyicons/outline/arrow-right.svg';

  import { accentTags, generateLinkTags } from '$utils/accentTags';

  import { CsvParsedTransactionResolution } from '$core/import/constants';
  import {
    autocompleteDataStore,
    mutateStateWithTransactionData,
    getCategoryIdsBasedOnMccAndMetaCategories,
  } from '$stores/decr/autocomplete';
  import { getTransposedAutocomplete } from '$core/import/selfUpdatingAutocomplete';
  import { getInitialTransactionState } from '$core/import/getInitialTransactionState';
  import { userEncrStore } from '$stores/user';
  import { defaultAssetStore } from '$stores/decr/asset';
  import { currentWalletUserStore, defaultWalletUserIdStore } from '$stores/decr/walletUser';
  import { automationSettingsStore } from '$stores/decr/user';
  import { currentWalletTransactionStore } from '$stores/decr/transaction';
  import { getInitialParsingState } from '$core/import/getInitialParsingState';
  import { shouldTransactionBeAutoResolved } from '$core/import/autoResolve';
  import { currentWalletCategoryStore } from '$stores/decr/category';
  import { forumHelpPath } from '$core/routes';

  const dispatch = createEventDispatcher(),
    unresolvedTab = 'Unresolved';

  type State = {
    [unresolvedTab]: ParsedTransaction[];
    [CsvParsedTransactionResolution.save]: {
      transaction: OmitCommonFields<Transaction>;
      resolution: CsvParsedTransactionResolution.save | CsvParsedTransactionResolution.auto;
    }[];
    [CsvParsedTransactionResolution.draft]: OmitCommonFields<Transaction>[];
    [CsvParsedTransactionResolution.ignore]: OmitCommonFields<Transaction>[];
  };

  export let dataSource: ParsedTransaction[] | State, isSchemaProvided: boolean;

  let refreshingAutocompleteDataStore = $autocompleteDataStore;
  $: transposedAutocomplete = getTransposedAutocomplete(refreshingAutocompleteDataStore);

  let state: State;

  const _walletUserKeys = Object.keys($currentWalletUserStore),
    defaultInitialParsingStateData = {
      userId: $userEncrStore!.id,
      assetId: $defaultAssetStore.id,
      walletUserId: _walletUserKeys[0],
    },
    walletUserCount = _walletUserKeys.length;

  if (Array.isArray(dataSource)) {
    const initialState = getInitialParsingState({
      rawParsedTransactions: dataSource,
      autocompleteData: refreshingAutocompleteDataStore,
      defaultData: defaultInitialParsingStateData,
      settings: $automationSettingsStore,
      transactionCount: Object.keys($currentWalletTransactionStore).length,
      getFallbackByMcc: $getCategoryIdsBasedOnMccAndMetaCategories,
      walletUserCount,
    });

    state = {
      [unresolvedTab]: initialState.toResolveManually,
      [CsvParsedTransactionResolution.save]: initialState.toResolveAuto.map(tr => ({
        transaction: tr,
        resolution: CsvParsedTransactionResolution.auto,
      })),
      [CsvParsedTransactionResolution.draft]: [],
      [CsvParsedTransactionResolution.ignore]: [],
    };
  } else if (dataSource?.hasOwnProperty(unresolvedTab)) state = dataSource;
  else throw new Error();

  $: dispatch('cacheState', state);

  const tabs = [
    { value: unresolvedTab, label: $_('cmps.import.queue.unresolved') },
    { value: CsvParsedTransactionResolution.save, label: $_('common.form.save') },
    { value: CsvParsedTransactionResolution.draft, label: $_('cmps.import.queue.draft') },
    { value: CsvParsedTransactionResolution.ignore, label: $_('cmps.import.queue.ignore') },
  ];
  let activeTab = unresolvedTab;

  const getCount = (_state: State, tabName: keyof State) => _state[tabName].length;

  $: parsedTransaction = state[unresolvedTab][0];
  let transactionToResolve: OmitCommonFields<Transaction> | undefined,
    suggestedCategoryIds: string[] | undefined;
  $: if (parsedTransaction) {
    const res = getInitialTransactionState({
      parsedTransaction,
      defaultData: defaultInitialParsingStateData,
      autocompleteData: transposedAutocomplete,
      getFallbackByMcc: $getCategoryIdsBasedOnMccAndMetaCategories,
      walletUserCount,
    });
    if (
      shouldTransactionBeAutoResolved({
        autocompleteData: $autocompleteDataStore,
        transaction: res.transaction,
        settings: $automationSettingsStore,
      })
    )
      unresolvedSuccess({
        resolution: CsvParsedTransactionResolution.auto,
        transaction: res.transaction as OmitCommonFields<Transaction>,
      });
    else {
      suggestedCategoryIds = res.suggestedCategoryIds;
      transactionToResolve = {
        ...res.transaction,
        walletUserId: res.transaction.walletUserId || $defaultWalletUserIdStore,
      };
    }
  } else transactionToResolve = undefined;

  const unresolvedSuccessHandler = (
      e: CustomEvent<{
        resolution: CsvParsedTransactionResolution;
        transaction: OmitCommonFields<Transaction>;
      }>,
    ) => unresolvedSuccess(e.detail),
    unresolvedSuccess = ({
      transaction,
      resolution,
    }: {
      resolution: CsvParsedTransactionResolution;
      transaction: OmitCommonFields<Transaction>;
    }) => {
      if (resolution == CsvParsedTransactionResolution.draft)
        state[CsvParsedTransactionResolution.draft].push({
          ...transaction,
          isDraft: true,
        });
      else if (resolution == CsvParsedTransactionResolution.ignore)
        state[CsvParsedTransactionResolution.ignore].push(transaction);
      else {
        // Mutation local state of autocomplete data with new saved info
        mutateStateWithTransactionData(refreshingAutocompleteDataStore, transaction);
        refreshingAutocompleteDataStore = refreshingAutocompleteDataStore;

        state[CsvParsedTransactionResolution.save].push({ transaction, resolution });
      }

      state[unresolvedTab].shift();
      state = state;
      /**
       * There's a shady bug here. Sometimes, when and if the user has cached stuff right after
       * some transactions from the queue were automatically resolved, the state that is passed
       * in props to slotted components can become stale and show, that there's no transactions
       * to work with, but have like 100+ in the state tab.
       */
      tick().then(() => (state = state));
    };

  const editSuccessHandler = ({
    detail,
  }: CustomEvent<{
    index: number;
    oldResolution: Exclude<CsvParsedTransactionResolution, CsvParsedTransactionResolution.auto>;
    resolution: Exclude<CsvParsedTransactionResolution, CsvParsedTransactionResolution.auto>;
    transaction: OmitCommonFields<Transaction>;
  }>) => {
    const { index, oldResolution, resolution, transaction } = detail;

    if (oldResolution == resolution) {
      if (oldResolution == CsvParsedTransactionResolution.save)
        state[oldResolution][index].transaction = transaction;
      else state[oldResolution][index] = transaction;
    } else {
      state[oldResolution].splice(index, 1);

      if (resolution == CsvParsedTransactionResolution.save)
        state[resolution].push({ resolution, transaction });
      else state[resolution].push(transaction);
    }

    state = state;
  };

  /**
   * The submit works VERY hacky but is very stable.
   *
   * The biggest problem is that Svelte has a very pesky bug when working with slots, transitions
   * and element/component references at the same time. TL;DR: references become `null` and
   * nothing really helps (even bindings fail to work correctly).
   * TODO: fix after this is fixed https://github.com/sveltejs/svelte/issues/5589
   *
   * The solution is very bad, but it works: we try to find a node that is <button type=submit />.
   * If there is one, then the user entered the edit mode. We need to click on this, so the Form
   * validates and cleans everything. We'll get the result with an event.
   * If there is none, then user haven't opened a form, so we can use `transactionToResolve` and
   * just save it.
   */
  let rootFormRef: HTMLElement | undefined;
  const triggerManualSubmit = ({
    detail: resolution,
  }: CustomEvent<CsvParsedTransactionResolution>) => {
    const submitEl = rootFormRef?.querySelector('button[type=submit]') as
      | HTMLButtonElement
      | undefined;
    if (submitEl) submitEl.click();
    else unresolvedSuccess({ transaction: transactionToResolve!, resolution });
  };

  $: submitDisabled = !(
    state[CsvParsedTransactionResolution.save].length ||
    state[CsvParsedTransactionResolution.draft].length ||
    state[CsvParsedTransactionResolution.ignore].length
  );
  const submitState = () => {
    const {
      [unresolvedTab]: unresolvedQueue,
      [CsvParsedTransactionResolution.save]: saveAndAuto,
      ...stateToSubmit
    } = state;

    /**
     * If there's any unresolved transactions left we save it for the future.
     * Otherwise we drop the cache so it doesn't interfere in out future uploads.
     */
    if (unresolvedQueue.length)
      dispatch('cacheState', {
        [unresolvedTab]: unresolvedQueue,
        [CsvParsedTransactionResolution.save]: [],
        [CsvParsedTransactionResolution.draft]: [],
        [CsvParsedTransactionResolution.ignore]: [],
      });
    else dispatch('dropCache');

    dispatch('submit', {
      ...stateToSubmit,
      [CsvParsedTransactionResolution.save]: saveAndAuto.map(obj => obj.transaction),
    });
  };

  // Onboarding
  $: textSlotWidth = $media.mobile ? 300 : 400;

  type OnboardingSteps =
    | 'intro'
    // Unresolved and Saved
    | 'tabsUnS'
    // Draft and Ignores
    | 'tabsD'
    | 'tabsI'
    | 'transaction'
    | 'final';
  let currentStep: OnboardingSteps = 'intro';
  const key = 'csvQueue';

  // Purely to have a single subscription instead of creating new subscriptions for every new card
  const getCategory = (id: string | undefined | null) =>
      id ? $currentWalletCategoryStore[id] : undefined,
    getWalletUser = (id: string | undefined | null) =>
      id ? $currentWalletUserStore[id] : undefined;
</script>

<Onboarding
  noSlot
  {textSlotWidth}
  {key}
  shouldShow={currentStep == 'intro' && !!state[unresolvedTab].length}>
  <svelte:fragment slot="text">
    <Text header>{$_('cmps.import.queue.onboarding.automation.header')}</Text>
    <Text>{$_('cmps.import.queue.onboarding.automation.main')}</Text>
    <button class="button mt-3" on:click={() => (currentStep = 'tabsUnS')}
      >{$_('common.letsStart')}</button>
  </svelte:fragment>
</Onboarding>

<div class="settings-area mb-3">
  <div class="mr-2 is-size-7">
    <Troubleshoot right>
      <div class="px-4">
        <p class="is-size-6 mb-2">{$_('cmps.import.queue.troubleshoot.question')}</p>
        <p>
          {@html $_('cmps.import.queue.troubleshoot.goToForum', {
            values: generateLinkTags(forumHelpPath),
          })}
        </p>
      </div>
      {#if isSchemaProvided}
        <hr class="dropdown-divider" />
        <div class="px-4">
          <p>{$_('cmps.import.queue.troubleshoot.resetIfSure')}</p>
          <button class="button is-small mt-3 is-fullwidth" on:click={() => dispatch('resetScheme')}
            >{$_('cmps.import.queue.troubleshoot.reset')}</button>
        </div>
      {/if}
    </Troubleshoot>
  </div>
  <AutomationSettings />
</div>

<div class="main">
  <Onboarding preventSlotClick bottom {textSlotWidth} shouldShow={currentStep.startsWith('tabs')}>
    <Tabs sticky classes="is-centered is-small" {tabs} bind:activeTab let:tab>
      <span class="tag mr-2">{getCount(state, tab.value)}</span>
      <span>{tab.label || tab.value}</span>
    </Tabs>

    <svelte:fragment slot="text">
      <CrossfadeWrapper key={currentStep}>
        {#if currentStep == 'tabsUnS'}
          <Text>
            {@html $_('cmps.import.queue.onboarding.tabs.queue', {
              values: { ...accentTags, tab: $_('cmps.import.queue.unresolved') },
            })}
          </Text>
          <Text>
            {@html $_('cmps.import.queue.onboarding.tabs.save', {
              values: { ...accentTags, tab: $_('common.form.save') },
            })}
          </Text>
          <button class="button mt-3" on:click={() => (currentStep = 'tabsD')}
            >{$_('common.next')}</button>
        {:else if currentStep == 'tabsD'}
          <Text>
            {@html $_('cmps.import.queue.onboarding.tabs.draft', {
              values: { ...accentTags, tab: $_('cmps.import.queue.draft') },
            })}
          </Text>
          <button class="button mt-3" on:click={() => (currentStep = 'tabsI')}
            >{$_('common.okDok')}</button>
        {:else if currentStep == 'tabsI'}
          <Text>
            {@html $_('cmps.import.queue.onboarding.tabs.ignore', {
              values: { ...accentTags, tab: $_('cmps.import.queue.ignore') },
            })}
          </Text>
          <button class="button mt-3" on:click={() => (currentStep = 'transaction')}
            >{$_('common.allClear')}</button>
        {/if}
      </CrossfadeWrapper>
    </svelte:fragment>
  </Onboarding>

  <div class="tab-container py-4" bind:this={rootFormRef}>
    <CrossfadeWrapper key={activeTab}>
      {#if activeTab == unresolvedTab}
        <Unresolved
          {transactionToResolve}
          {suggestedCategoryIds}
          category={getCategory(transactionToResolve?.categoryId)}
          walletUser={getWalletUser(transactionToResolve?.walletUserId)}
          defaultWalletUserId={$defaultWalletUserIdStore}
          showOnboarding={currentStep == 'transaction'}
          on:onboardingFinish={() => (currentStep = 'final')}
          on:triggerManualSubmit={triggerManualSubmit}
          on:success={unresolvedSuccessHandler} />
      {:else if activeTab == CsvParsedTransactionResolution.save}
        <ResolvedAutoTransactionList
          transactionsWithResolution={state[CsvParsedTransactionResolution.save]}
          on:success={editSuccessHandler} />
      {:else if activeTab == CsvParsedTransactionResolution.ignore}
        <ResolvedTransactionList
          transactions={state[CsvParsedTransactionResolution.ignore]}
          currResolution={CsvParsedTransactionResolution.ignore}
          on:success={editSuccessHandler} />
      {:else}
        <ResolvedTransactionList
          transactions={state[CsvParsedTransactionResolution.draft]}
          currResolution={CsvParsedTransactionResolution.draft}
          on:success={editSuccessHandler} />
      {/if}
    </CrossfadeWrapper>
  </div>
</div>

<div class="submit-wrapper">
  <Onboarding right {textSlotWidth} {key} shouldShow={currentStep == 'final'} let:finishOnboarding>
    <button class="submit button is-success" disabled={submitDisabled} on:click={submitState}>
      <span>{$_('common.form.submit')}</span>
      <span class="icon"
        ><img src={arrowRightIcon} alt="arrow right" height="15" width="15" /></span>
    </button>

    <svelte:fragment slot="text">
      <Text>{$_('cmps.import.queue.onboarding.final.clickWhenSave')}</Text>
      <Text>{$_('cmps.import.queue.onboarding.final.savePlace')}</Text>
      <button class="button mt-5" on:click={finishOnboarding}>{$_('common.letsStart')}</button>
    </svelte:fragment>
  </Onboarding>
</div>

<style lang="scss">
  .main {
    grid-area: var(--main-area);
  }

  .submit-wrapper {
    justify-self: end;
    grid-area: var(--big-submit-area);
  }

  .tab-container {
    @include mq($until: tablet) {
      width: 100%;
    }
    @include mq($from: tablet) {
      width: 80%;
    }
    margin: 0 auto;
  }
</style>
