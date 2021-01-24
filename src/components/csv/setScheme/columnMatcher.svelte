<script>
  import Tooltip from '@/components/elements/tooltip.svelte';

  import Choice from '@/components/strict/inputs/select/choice.svelte';
  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { copy } from '@/utils/object';

  import { FieldResolution, fieldChoices } from '@/core/csv/constants';

  export let columnCount: number, columnMatch: Array<string | null>, dateFormat: string;

  $: columnMatch = state.map(({ value }) => (value == FieldResolution.ignore ? null : value));

  $: state = [...Array(columnCount).keys()].map(() => ({
    choices: copy(fieldChoices),
    value: FieldResolution.ignore,
  }));

  const setChoiceOptionsAvailability = (stateCopy: typeof state) => {
    const fieldsTaken = stateCopy
      .filter(columnData => columnData.value != FieldResolution.ignore)
      .map(columnData => columnData.value);

    for (let i = 0; i < state.length; i++) {
      const columnData = state[i];

      columnData.choices = columnData.choices.map(choice => ({
        ...choice,
        disabled: choice.value == columnData.value ? false : fieldsTaken.includes(choice.value),
      }));
    }

    state = state;
  };

  $: setChoiceOptionsAvailability(state);
</script>

{#each state as columnData}
  <div class="main">
    <div class="control">
      <div class="select is-small is-fullwidth">
        <select bind:value={columnData.value}>
          <Choice choices={columnData.choices} />
        </select>
      </div>
    </div>
    {#if columnData.value == FieldResolution.datetime}
      <div class="field pt-4" transition:slide|local>
        <div class="control">
          <input
            class="input is-small"
            type="text"
            placeholder="yyyy-MM-dd"
            aria-label={$_('cmps.csv.scheme.columnMatcher.date.label')}
            bind:value={dateFormat}
          />
        </div>

        <div>
          <span class="help">{$_('cmps.csv.scheme.columnMatcher.date.help')}</span>

          <Tooltip>
            <div class="tooltip-content">
              <p>
                {@html $_('cmps.csv.scheme.columnMatcher.date.formatInfo', {
                  values: { tagO: '<code>', tagC: '</code>' },
                })}
              </p>
              <p>
                {@html $_('cmps.csv.scheme.columnMatcher.date.formatExample', {
                  values: { tagO: '<code>', tagC: '</code>' },
                })}
              </p>
              <p>
                {@html $_('cmps.csv.scheme.columnMatcher.date.docs', {
                  values: {
                    tagO:
                      '<a href="https://date-fns.org/v2.16.1/docs/format" target="_blank" rel="noopener noreferrer">',
                    tagC: '</a>',
                  },
                })}
              </p>
            </div>
          </Tooltip>
        </div>
      </div>
    {/if}
  </div>
{/each}

<style lang="scss">
  .main {
    padding: 0.7em;
  }

  .help {
    display: inline;
  }

  .tooltip-content {
    > p {
      margin-bottom: 0.75em;
    }
  }
</style>
