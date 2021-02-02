<script>
  import type { ParsingResult } from '@/core/csv/types';
  import type { AllowedSchemeFields, BaseSimpleScheme } from '@/core/csv/types';

  import SchemaSettings from './settings.svelte';
  import ColumnMatcher from './columnMatcher.svelte';
  import Table from './table.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import cssVars from 'svelte-css-vars';

  import { longpress } from '@/utils/actions/longpress';
  import { bufferToString } from '@/utils/buffer/conversions';

  import { parseCsv } from '@/core/csv/parseCsv';

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
</script>

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

  .settings {
    justify-self: end;

    @include mq($until: tablet) {
      grid-area: var(--small-settings-area);
    }
    @include mq($from: tablet) {
      grid-area: var(--big-settings-area);
    }
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

<div class="settings mb-4" use:longpress={{ cb: () => console.log(JSON.stringify(getScheme())) }}>
  <SchemaSettings bind:encoding bind:header bind:decimal />
</div>

{#if decodedData && columnCount}
  <div class="main-wrapper">
    <div class="main py-3 px-4 custom-scrollbar" use:cssVars={{ columnCount }}>
      <ColumnMatcher {columnCount} bind:columnMatch bind:dateFormat />
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
  <button class="button is-success is-outlined" on:click={success} disabled={!!error}
    >{$_('common.form.ok')}</button>
</div>
