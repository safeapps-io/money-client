<script>
  import Tooltip from '$components/elements/tooltip.svelte';

  import { _ } from 'svelte-i18n';
  import { copy } from '$utils/object';

  import { runSimpleScheme } from '$core/import/simpleSchemes';
  import { ParseErrorCodes } from '$core/import/types';
  import { FieldResolution } from '$core/import/constants';
  import { guessDateFormat } from '$core/import/guessDateFormat';
  import { transactionsToIgnoreSetStore } from '$stores/decr/ignoredTransaction';

  export let dataRows: string[][],
    headerRow: string[] | undefined = undefined,
    columnCount: number,
    currentWalletCurrency: string;

  export let columnMatch: Array<string | null>,
    dateFormat: string | undefined,
    error: string | undefined,
    decimal: string;

  $: dataRowsCopy = copy(dataRows);

  $: if (!dateFormat && columnMatch.includes(FieldResolution.datetime)) {
    const columnIndex = columnMatch.indexOf(FieldResolution.datetime);
    dateFormat = guessDateFormat(dataRowsCopy.map(row => row[columnIndex]));
  }

  let dataAfterRun: ThenArg<ReturnType<typeof runSimpleScheme>> | undefined = undefined;
  $: runSimpleScheme({
    data: dataRowsCopy,
    ignoredTransactionHashSet: $transactionsToIgnoreSetStore,
    currentWalletCurrency,
    scheme: {
      fieldnameMap: (columnMatch as any) || [],
      transformDateFormat: dateFormat || '',
      decimalDelimiterChar: decimal,
    },
  }).then(res => (dataAfterRun = res));

  $: extraTableData = dataRowsCopy.flatMap((rowData, rowIndex) =>
    rowData.map((cellData, columnIndex) => {
      const res: { raw: string; processed?: string } = { raw: cellData };
      if (!dataAfterRun) return res;

      let processed: string | number | Date | undefined = undefined;

      if (columnMatch[columnIndex] == FieldResolution.amount)
        processed = dataAfterRun.parsedRows[rowIndex]?.amount;
      else if (columnMatch[columnIndex] == FieldResolution.originalAmount)
        processed = dataAfterRun.parsedRows[rowIndex]?.originalAmount;
      else if (
        columnMatch[columnIndex] == FieldResolution.datetime &&
        dataAfterRun.parsedRows[rowIndex]?.datetime
      )
        processed = new Date(dataAfterRun.parsedRows[rowIndex].datetime!);

      res.processed = processed?.toLocaleString();
      return res;
    }),
  );

  const defaultHeaderName = '—';
  $: defaultHeader = Array(columnCount).fill(defaultHeaderName);

  const enum HeaderColumnState {
    ignore,
    success,
    error,
  }

  $: header = (headerRow || defaultHeader).map((value, index) => {
    const columnFieldResolution = columnMatch[index],
      columnErrors = dataAfterRun?.rowBasedParseErrors.filter(err => err.column == index) || [],
      displayErrors = columnErrors.slice(0, 3);

    let state: HeaderColumnState;
    if (!columnFieldResolution) state = HeaderColumnState.ignore;
    else if (!columnErrors.length) state = HeaderColumnState.success;
    else state = HeaderColumnState.error;

    return {
      value,
      state,
      displayErrors,
      errorsMore: columnErrors.length - displayErrors.length,
    };
  });

  $: {
    const haveAmount = columnMatch.includes(FieldResolution.amount),
      haveDate = columnMatch.includes(FieldResolution.datetime);

    if (dataAfterRun && haveAmount && haveDate)
      error = dataAfterRun.rowBasedParseErrors.length
        ? $_('cmps.import.scheme.errors.noParse')
        : undefined;
    else {
      const errors = [];
      if (!haveAmount) errors.push($_('cmps.transaction.common.amount'));
      if (!haveDate) errors.push($_('cmps.transaction.common.date'));

      error = $_('cmps.import.scheme.errors.needSet', {
        values: { fields: errors.join(', ').toLowerCase() },
      });
    }
  }
</script>

{#each header as { value, state, displayErrors, errorsMore }}
  <div class="header-row">
    <Tooltip showTooltip={state == HeaderColumnState.error}>
      <svelte:fragment slot="trigger">
        {#if state == HeaderColumnState.success}
          {value} 👌
        {:else if state == HeaderColumnState.error}
          <span class="trigger">{value}</span> ❌
        {/if}
      </svelte:fragment>

      {#each displayErrors as err}
        <p>
          {$_('cmps.import.scheme.errors.row', { values: { num: err.row + 1 } })}:
          {#if err.code == ParseErrorCodes.invalidDate}
            {$_('cmps.import.scheme.errors.invalidDate')}
          {:else if err.code == ParseErrorCodes.invalidCurrency}
            {$_('cmps.import.scheme.errors.invalidCurrency')}
          {:else if err.code == ParseErrorCodes.invalidNumber}
            {$_('cmps.import.scheme.errors.invalidNum')}
          {/if}

          {#if err.example}
            {@html $_('cmps.import.scheme.errors.example', {
              values: { example: err.example, tagO: '<code>', tagC: '</code>' },
            })}
          {/if}
        </p>
      {/each}
      {#if errorsMore}
        <p>{$_('cmps.import.scheme.errors.andNErrors', { values: { count: errorsMore } })}</p>
      {/if}
    </Tooltip>
  </div>
{/each}

{#each extraTableData as row}
  <div class="data-row">
    {#if row.processed}
      <div><s>{row.raw}</s></div>
      <div><code>{row.processed}</code></div>
    {:else}
      <div>{row.raw || '—'}</div>
    {/if}
  </div>
{/each}

<style lang="scss">
  $cell-padding: 0.9em 1.1em;

  .header-row {
    padding: $cell-padding;
    margin: 1em 0;

    border-bottom: 1px dotted var(--borderColor);
    border-top: 1px dotted var(--borderColor);

    text-transform: uppercase;
    font-size: 80%;
    font-weight: bold;
    color: #888;
  }

  .data-row {
    padding: $cell-padding;
    border-right: 1px dotted var(--borderColor);
  }
</style>
