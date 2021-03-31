<script>
  import type { FileParsedToBinary } from './types';
  import type { OmitCommonFields, Transaction } from '$stores/decr/types';
  import type { BaseSimpleScheme, CustomScheme, ParsedTransaction } from '$core/import/types';

  import FileForm from './fileForm.svelte';
  import WalletSelectFromJoint from '$components/wallet/walletSelectFromJoint.svelte';
  import { Onboarding, Text } from '$components/onboarding';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import Loader from '$components/elements/loader.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, getContext, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';

  import { bufferToString } from '$utils/buffer/conversions';
  import { persistStoreLs } from '$utils/persistStore';

  import {
    transactionsToIgnoreSetStore,
    updateIgnoredTransaction,
  } from '$stores/decr/ignoredTransaction';
  import { transactionBulkAdd } from '$stores/decr/transaction';
  import { selectedWalletStore } from '$stores/wallet';
  import { addUserScheme, hasUserSeenOnboarding } from '$stores/decr/user';
  import { allLocalSchemes } from '$stores/scheme';
  import { defaultAssetStore } from '$stores/decr/asset';

  import { CsvParsedTransactionResolution } from '$core/import/constants';

  const dispatch = createEventDispatcher(),
    successNotif = getContext('success'),
    dangerNotif = getContext('danger');

  const cachedStateStore = writable<{ state: any; timestamp: number; filename: string } | null>(
      null,
    ),
    unsub = persistStoreLs('csvImportState', cachedStateStore),
    setCache = ({ detail }: CustomEvent<any>) =>
      ($cachedStateStore = { state: detail, timestamp: new Date().getTime(), filename }),
    dropCache = () => cachedStateStore.set(null);

  onDestroy(() => unsub?.());

  let shouldPassCacheData: any | undefined = undefined;
  const useCache = () => {
      const { state: _state, filename: _filename } = $cachedStateStore!;
      shouldPassCacheData = _state;
      filename = _filename;

      state = State.resultParsed;
    },
    useFileUpload = () => {
      dropCache();
      state = State.fileUpload;
    };

  const enum State {
    hasCache,
    fileUpload,
    needScheme,
    resultParsed,
  }
  let state = $cachedStateStore ? State.hasCache : State.fileUpload;

  let walletId: string | undefined;

  $: currentWalletCurrency = $defaultAssetStore.decr.code;

  let filename: string,
    encodedData: ArrayBuffer,
    parsedRows: ParsedTransaction[],
    noDataParsed = false,
    isSchemaProvided: boolean;

  const runSchemeAgainstData = async (scheme: BaseSimpleScheme | CustomScheme) => {
    const module = await import('$core/import/parseData'),
      csvParsedData = await module.parseData({
        ignoredTransactionHashSet: $transactionsToIgnoreSetStore,
        scheme,
        currentWalletCurrency,
        data: bufferToString(encodedData, scheme.encoding),
      });

    parsedRows = csvParsedData.parsedRows;
    if (parsedRows.length) {
      isSchemaProvided = true;
      state = State.resultParsed;
    } else noDataParsed = true;
  };

  const startCsvProcess = async (data: ArrayBuffer) => {
      const module = await import('$core/import/guessParsingScheme');

      const scheme = await module.guessParsingScheme({
        data,
        schemes: $allLocalSchemes,
        currentWalletCurrency,
      });
      if (scheme) await runSchemeAgainstData(scheme);
      else {
        if ($hasUserSeenOnboarding('setScheme'))
          dangerNotif($_('cmps.import.scheme.onboarding.unknown.title'));
        state = State.needScheme;
      }
    },
    startOfxProcess = async (data: ArrayBuffer) => {
      const module = await import('$core/import/parseOfxData'),
        stringData = bufferToString(data);

      parsedRows = Array.from(
        module.parseOfxData({
          data: stringData,
          currentWalletCurrency,
          previousOfxIdsSet: $transactionsToIgnoreSetStore,
        }),
      );
      if (parsedRows.length) {
        isSchemaProvided = false;
        state = State.resultParsed;
      } else noDataParsed = true;
    };

  const getBinaryData = async ({ detail }: CustomEvent<FileParsedToBinary>) => {
      noDataParsed = false;
      filename = detail.filename;
      encodedData = detail.data;

      if (detail.filename.endsWith('.ofx')) startOfxProcess(encodedData);
      else if (detail.filename.endsWith('.csv')) startCsvProcess(encodedData);
    },
    setScheme = async ({ detail }: CustomEvent<BaseSimpleScheme>) => {
      await addUserScheme(detail);
      runSchemeAgainstData(detail);
    },
    resetScheme = () => {
      dropCache();
      state = State.needScheme;
    };

  const finalSubmit = async ({
    detail,
  }: CustomEvent<
    { [state in CsvParsedTransactionResolution]: OmitCommonFields<Transaction>[] }
  >) => {
    const currWallet = walletId || $selectedWalletStore!;

    updateIgnoredTransaction(
      currWallet,
      detail[CsvParsedTransactionResolution.ignore].map(
        tr => (tr.autocomplete.sourceDataHash || tr.autocomplete.id)!,
      ),
    );
    await transactionBulkAdd(walletId || $selectedWalletStore!, [
      ...detail[CsvParsedTransactionResolution.save],
      ...detail[CsvParsedTransactionResolution.draft],
    ]);

    successNotif($_('common.form.okNotif'));
    dispatch('success');
  };
</script>

<div class="is-relative">
  <CrossfadeWrapper replayAnimationKey={state}>
    {#if state == State.hasCache}
      <div class="prev-cache">
        <p class="mb-4">
          {@html $_('cmps.import.cache.prevFile', {
            values: {
              filename: $cachedStateStore?.filename,
              date: new Date($cachedStateStore?.timestamp || 0),
              tagO: '<code>',
              tagC: '</code>',
            },
          })}
        </p>
        <p class="mb-5">{$_('cmps.import.cache.decision')}</p>

        <div>
          <button class="button" on:click={useCache}>{$_('common.form.continue')}</button>

          <button class="button is-danger is-outlined" on:click={useFileUpload}
            >{$_('cmps.import.cache.drop')}</button>
        </div>
      </div>
    {:else if state == State.fileUpload}
      <WalletSelectFromJoint bind:walletId />
      <Onboarding shouldShow bottom key="fileImport" let:finishOnboarding>
        <FileForm
          {noDataParsed}
          on:binaryData={async e => {
            await finishOnboarding();
            getBinaryData(e);
          }} />

        <svelte:fragment slot="text">
          <Text header>{$_('cmps.wallet.onboarding.importFile.title')}</Text>
          <Text>
            {@html $_('cmps.wallet.onboarding.importFile.main', {
              values: { tagO: '<code>', tagC: '</code>' },
            })}
          </Text>
        </svelte:fragment>
      </Onboarding>
    {:else}
      <div class="main-wrapper">
        <h3 class="subtitle filename overflow-ellipsis" title={filename}>{filename}</h3>
        {#if state == State.needScheme}
          {#await import('./setScheme/main.svelte')}
            <div class="loader-block">
              <Loader height={250} />
            </div>
          {:then SetScheme}
            <SetScheme.default {currentWalletCurrency} {encodedData} on:success={setScheme} />
          {/await}
        {:else if state == State.resultParsed}
          {#await import('./queue/main.svelte')}
            <div class="loader-block">
              <Loader height={250} />
            </div>
          {:then ParsedTransactionQueue}
            <ParsedTransactionQueue.default
              {isSchemaProvided}
              dataSource={shouldPassCacheData ? shouldPassCacheData : parsedRows}
              on:resetScheme={resetScheme}
              on:cacheState={setCache}
              on:dropCache={dropCache}
              on:submit={finalSubmit} />
          {/await}
        {/if}
      </div>
    {/if}
  </CrossfadeWrapper>
</div>

<style lang="scss">
  .prev-cache {
    display: flex;
    flex-direction: column;
    place-items: center;
    place-content: center;
    text-align: center;

    height: 400px;
  }

  .main-wrapper {
    display: grid;
    grid-template-columns: 4fr repeat(2, 1fr);

    --small-settings-area: 1 / 3 / 2 / 4;
    --big-settings-area: 1 / 2 / 2 / 4;
    --main-area: 2 / 1 / 3 / 4;
    --small-submit-area: 3 / 3 / 4 / 4;
    --big-submit-area: 3 / 1 / 4 / 4;

    :global(.settings-area) {
      display: flex;
      justify-self: end;

      @include mq($until: tablet) {
        --dropdown-min-width: 90vw;
        grid-area: var(--small-settings-area);
      }
      @include mq($from: tablet) {
        --dropdown-min-width: 320px;
        grid-area: var(--big-settings-area);
      }
    }
  }

  .filename {
    @include mq($until: tablet) {
      grid-area: 1 / 1 / 2 / 3;
    }
    @include mq($from: tablet) {
      grid-area: 1 / 1 / 2 / 2;
    }
  }

  .loader-block {
    grid-area: var(--main-area);
  }
</style>
