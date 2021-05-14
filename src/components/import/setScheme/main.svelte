<script>
  import type { ParsingResult } from '$core/import/types';
  import type { AllowedSchemeFields, BaseSimpleScheme } from '$core/import/types';
  import type { SetSchemeOnboardingSteps } from '../types';

  import { Onboarding, Text } from '$components/onboarding';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import Troubleshoot from '$components/elements/dropdown/troubleshoot.svelte';
  import SchemaSettings from './settings.svelte';
  import ColumnMatcher from './columnMatcher.svelte';
  import Table from './table.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import cssVars from 'svelte-css-vars';

  import { longpress } from '$utils/actions/longpress';
  import { bufferToString } from '$utils/buffer/conversions';
  import { accentTags, generateLinkTags } from '$utils/accentTags';

  import { parseCsv } from '$core/import/parseCsv';
  import { forumBankHelpPath } from '$core/routes';
  import { supportEmail } from '$services/config';

  const dispatch = createEventDispatcher();

  export let encodedData: ArrayBuffer, currentWalletCurrency: string;

  let encoding: string, header: boolean, decimal: string;

  let decodedData: ParsingResult | undefined = undefined;
  const launchParsing = async (_encodedData: ArrayBuffer, _encoding: string, _header: boolean) => {
      try {
        decodedData = await parseCsv({
          data: bufferToString(_encodedData, _encoding),
          config: { encoding: _encoding, header: _header },
          preview: 10,
        });
      } catch (error) {}
    },
    getScheme = (): BaseSimpleScheme => ({
      fieldnameMap: columnMatch as AllowedSchemeFields[],
      transformDateFormat: dateFormat,
      decimalDelimiterChar: decimal,
      header,
      encoding,
    }),
    success = () => dispatch('success', getScheme());

  $: launchParsing(encodedData, encoding, header);
  $: columnCount = decodedData?.dataRows[0]?.length || 0;

  let columnMatch: string[] = [],
    dateFormat: string = '',
    error: string | undefined;

  let currentStep: SetSchemeOnboardingSteps = 'unknown';
  const key = 'setScheme';
</script>

<Onboarding
  noSlot
  {key}
  shouldShow={currentStep == 'unknown' ||
    currentStep == 'isBank' ||
    currentStep == 'notBank' ||
    currentStep == 'finish'}
  let:finishOnboarding>
  <svelte:fragment slot="text">
    <CrossfadeWrapper key={currentStep}>
      {#if currentStep == 'unknown'}
        <Text header>{$_('cmps.import.scheme.onboarding.unknown.title')}</Text>
        <Text>{$_('cmps.import.scheme.onboarding.unknown.main')}</Text>
        <button class="button is-small mt-3" on:click={() => (currentStep = 'isBank')}
          >{$_('cmps.import.scheme.onboarding.unknown.cta')}</button>
      {:else if currentStep == 'isBank'}
        <Text header>{$_('cmps.import.scheme.onboarding.isBank.title')}</Text>
        <Text>{$_('cmps.import.scheme.onboarding.isBank.main1')}</Text>
        <Text>{$_('cmps.import.scheme.onboarding.isBank.main2')}</Text>
        <button class="button is-small mt-3" on:click={() => (currentStep = 'notBank')}
          >{$_('common.allClear')}</button>
      {:else if currentStep == 'notBank'}
        <Text header>{$_('cmps.import.scheme.onboarding.notBank.title')}</Text>
        <Text
          >{@html $_('cmps.import.scheme.onboarding.notBank.main', {
            values: accentTags,
          })}</Text>
        <button class="button is-small mt-3" on:click={() => (currentStep = 'settings')}
          >{$_('cmps.import.scheme.onboarding.notBank.cta')}</button>
      {:else}
        <Text>{$_('cmps.import.scheme.onboarding.finish.main')}</Text>
        <button class="button is-small mt-3" on:click={finishOnboarding}
          >{$_('cmps.import.scheme.onboarding.finish.cta')}</button>
      {/if}
    </CrossfadeWrapper>
  </svelte:fragment>
</Onboarding>

<div
  class="settings-area mb-4"
  use:longpress={{ cb: () => console.log(JSON.stringify(getScheme())) }}>
  <div class="mr-2 is-size-7">
    <Troubleshoot right text={$_('cmps.import.scheme.bankStatement.button')}>
      <div class="px-4">
        <p class="mb-3">
          {$_('cmps.import.scheme.bankStatement.main')}
        </p>
        <p>
          {@html $_('cmps.import.scheme.bankStatement.link', {
            values: {
              ...generateLinkTags(forumBankHelpPath, true),
              ...generateLinkTags(`mailto:${supportEmail}`, true, 'email'),
              ...accentTags,
              email: supportEmail,
            },
          })}
        </p>
      </div>
    </Troubleshoot>
  </div>

  <Onboarding right bottom preventSlotClick shouldShow={currentStep == 'settings'}>
    <SchemaSettings bind:encoding bind:header bind:decimal />
    <svelte:fragment slot="text">
      <Text header>{$_('cmps.import.scheme.onboarding.settings.title')}</Text>
      <Text>{$_('cmps.import.scheme.onboarding.settings.main')}</Text>
      <button class="button is-small mt-3" on:click={() => (currentStep = 'main')}
        >{$_('common.allClear')}</button>
    </svelte:fragment>
  </Onboarding>
</div>

{#if decodedData && columnCount}
  <div class="main-wrapper">
    <div class="main py-3 px-4 custom-scrollbar" use:cssVars={{ columnCount }}>
      <ColumnMatcher {columnCount} bind:currentStep bind:columnMatch bind:dateFormat />
      <Table
        bind:error
        bind:dateFormat
        {currentWalletCurrency}
        {columnCount}
        {columnMatch}
        {decimal}
        headerRow={decodedData.headerRow}
        dataRows={decodedData.dataRows} />
    </div>
    <div class="overlay" />
  </div>
{/if}
<div class="submit mt-4">
  {#if error}
    <div class="has-text-danger is-size-7 mx-4 my-4">{error}</div>
  {/if}
  <button class="button is-success" on:click={success} disabled={!!error}
    >{$_('common.form.ok')}</button>
</div>

<style lang="scss">
  :root {
    --columnCount: 0;
    --borderColor: hsla(0, 0%, 53%, 0.2);
  }

  $background-color: hsl(0, 0%, 98.5%);

  .main-wrapper {
    position: relative;
    grid-area: var(--main-area);
  }

  .main {
    display: grid;
    place-items: stretch;
    grid-template-columns: repeat(var(--columnCount), max-content);

    overflow-x: scroll;

    font-size: 90%;
    background-color: $background-color;
  }

  .overlay {
    position: absolute;
    right: 0;
    left: 0;
    bottom: $scrollbar-size;
    height: 100px;

    // Bug of rendering. Cannot use transparent, so need to use something very similar
    // https://stackoverflow.com/questions/11829410/css3-gradient-rendering-issues-from-transparent-to-white
    background: linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.01),
      ease-in-out,
      $background-color
    );
  }

  .submit {
    display: flex;
    place-items: center;
    place-content: flex-end;

    grid-area: var(--big-submit-area);

    @include mq($until: tablet) {
      flex-direction: column-reverse;
    }
  }
</style>
