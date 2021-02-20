<script>
  import type { SetSchemeOnboardingSteps } from '../types';

  import { Onboarding, Text } from '@/components/onboarding';
  import Tooltip from '@/components/elements/tooltip.svelte';
  import Choice from '@/components/strict/inputs/select/choice.svelte';

  import { _ } from 'svelte-i18n';
  import { slide } from 'svelte/transition';

  import { FieldResolution, fieldChoices } from '@/core/import/constants';

  export let columnCount: number,
    columnMatch: Array<string | null>,
    dateFormat: string,
    currentStep: SetSchemeOnboardingSteps;

  const localizedFieldChoices = fieldChoices.map(choice => ({
    value: choice.value,
    label: $_(choice.label),
  }));

  let state = [...Array(columnCount).keys()].map(() => ({
    choices: localizedFieldChoices,
    value: FieldResolution.ignore,
  }));

  $: columnMatch = state.map(({ value }) => (value == FieldResolution.ignore ? null : value));

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

{#each state as columnData, i}
  <div class="main">
    <div class="control">
      {#if i}
        <div class="select is-small is-fullwidth">
          <select bind:value={columnData.value}>
            <Choice choices={columnData.choices} />
          </select>
        </div>
      {:else}
        <!-- We only show onboarding on the first item -->
        <Onboarding bottom preventSlotClick shouldShow={currentStep == 'main'}>
          <div class="select is-small is-fullwidth">
            <select bind:value={columnData.value}>
              <Choice choices={columnData.choices} />
            </select>
          </div>

          <div slot="text">
            <Text header>{$_('cmps.csv.scheme.onboarding.main.title')}</Text>
            <Text>{$_('cmps.csv.scheme.onboarding.main.main1')}</Text>
            <Text>{$_('cmps.csv.scheme.onboarding.main.main2', { values: { emoji: '👌' } })}</Text>
            <button class="button is-small mt-3" on:click={() => (currentStep = 'finish')}
              >{$_('cmps.csv.scheme.onboarding.main.cta', { values: { emoji: '👌' } })}</button>
          </div>
        </Onboarding>
      {/if}
    </div>
    {#if columnData.value == FieldResolution.datetime}
      <div class="field pt-4" transition:slide|local>
        <div class="control">
          <input
            class="input is-small"
            type="text"
            placeholder="yyyy-MM-dd"
            aria-label={$_('cmps.csv.scheme.columnMatcher.date.label')}
            bind:value={dateFormat} />
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
