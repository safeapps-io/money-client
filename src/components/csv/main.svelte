<script>
  import type { FileParsedToBinary } from './types';
  import type { BaseSimpleScheme } from '@/stores/scheme';
  import type { OmitCommonFields, Transaction } from '@/stores/decr/types';

  import FileForm from './fileForm.svelte';
  import SetScheme from './setScheme/main.svelte';
  import ParsedTransactionQueue from './queue/main.svelte';
  import WalletSelectFromJoint from '@/components/wallet/walletSelectFromJoint.svelte';
  import NoSchemeDetected from './noSchemeDetected.svelte';
  import { Onboarding, Text } from '@/components/onboarding/index';
  import CrossfadeWrapper from '@/components/elements/crossfadeWrapper.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { writable } from 'svelte/store';
  import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { bufferToString } from '@/utils/buffer/conversions';
  import { persistStoreLs } from '@/utils/persistStore';

  import {
    ignoredTransactionHashSetStore,
    updateIgnoredTransaction,
  } from '@/stores/decr/ignoredTransaction';
  import { transactionBulkAdd } from '@/stores/decr/transaction';
  import { selectedWalletStore } from '@/stores/wallet';
  import { addUserScheme } from '@/stores/decr/user';
  import { allLocalSchemes } from '@/stores/scheme';
  import { defaultAssetStore } from '@/stores/decr/asset';

  import { guessParsingScheme, parseData } from '@/core/csv/parseData';
  import { CsvParsedTransactionResolution } from '@/core/csv/constants';
  import { notification } from '@/core/notification';

  const dispatch = createEventDispatcher(),
    { addNotification } = getNotificationsContext();

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
    userDecides,
    needScheme,
    resultParsed,
  }
  let state = $cachedStateStore ? State.hasCache : State.fileUpload;

  let walletId: string | undefined;

  $: currentWalletCurrency = $defaultAssetStore.decr.code;

  let filename: string,
    encodedData: ArrayBuffer,
    parsedData: ThenArg<ReturnType<typeof parseData>>,
    noDataParsed = false;

  const runSchemeAgainstData = async (
    scheme: BooleanCheck<ThenArg<ReturnType<typeof guessParsingScheme>>>,
  ) => {
    parsedData = await parseData({
      ignoredTransactionHashSet: $ignoredTransactionHashSetStore,
      scheme,
      currentWalletCurrency,
      data: bufferToString(encodedData, scheme.encoding),
    });
    if (parsedData.parsedRows.length) state = State.resultParsed;
    else noDataParsed = true;
  };

  const getBinaryData = async ({ detail }: CustomEvent<FileParsedToBinary>) => {
      noDataParsed = false;

      filename = detail.filename;
      encodedData = detail.data;
      const scheme = await guessParsingScheme({
        data: detail.data,
        schemes: $allLocalSchemes,
        currentWalletCurrency,
      });
      if (scheme) await runSchemeAgainstData(scheme);
      else state = State.userDecides;
    },
    setScheme = async ({ detail }: CustomEvent<BaseSimpleScheme>) => {
      await addUserScheme(detail);
      runSchemeAgainstData(detail);
    };

  const finalSubmit = async ({
    detail,
  }: CustomEvent<
    { [state in CsvParsedTransactionResolution]: OmitCommonFields<Transaction>[] }
  >) => {
    const currWallet = walletId || $selectedWalletStore!;

    updateIgnoredTransaction(
      currWallet,
      detail[CsvParsedTransactionResolution.ignore].map(tr => tr.autocomplete.sourceDataHash!),
    );
    await transactionBulkAdd(walletId || $selectedWalletStore!, [
      ...detail[CsvParsedTransactionResolution.save],
      ...detail[CsvParsedTransactionResolution.draft],
    ]);

    addNotification(notification({ text: $_('common.form.okNotif') }));
    dispatch('success');
  };
</script>

<div class="is-relative">
  <CrossfadeWrapper replayAnimationKey={state}>
    {#if state == State.hasCache}
      <div class="prev-cache">
        <p class="mb-4">
          {@html $_('cmps.csv.cache.prevFile', {
            values: {
              filename: $cachedStateStore?.filename,
              date: new Date($cachedStateStore?.timestamp || 0),
              tagO: '<code>',
              tagC: '</code>',
            },
          })}
        </p>
        <p class="mb-5">{$_('cmps.csv.cache.decision')}</p>

        <div>
          <button class="button" on:click={useCache}>{$_('common.form.continue')}</button>

          <button class="button is-danger is-outlined" on:click={useFileUpload}
            >{$_('cmps.csv.cache.drop')}</button
          >
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
          }}
        />

        <div slot="text">
          <Text header>{$_('cmps.wallet.onboarding.importFile.title')}</Text>
          <Text>
            {@html $_('cmps.wallet.onboarding.importFile.main', {
              values: { tagO: '<code>', tagC: '</code>' },
            })}
          </Text>
        </div>
      </Onboarding>
    {:else if state == State.userDecides}
      <NoSchemeDetected on:needScheme={() => (state = State.needScheme)} />
    {:else}
      <h3 class="subtitle filename overflow-ellipsis"><code>{filename}</code></h3>
      {#if state == State.needScheme}
        <SetScheme {currentWalletCurrency} {encodedData} on:success={setScheme} />
      {:else if state == State.resultParsed}
        <ParsedTransactionQueue
          dataSource={shouldPassCacheData ? shouldPassCacheData : parsedData.parsedRows}
          on:cacheState={setCache}
          on:dropCache={dropCache}
          on:submit={finalSubmit}
        />
      {/if}
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

  .filename {
    @include mq($from: tablet) {
      width: 70%;
    }
  }
</style>
