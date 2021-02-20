<script>
  import type { ShortcutSetting } from '@/utils/actions/shortcut';

  import Shortcut from '@/components/elements/shortcut.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';

  import { shortcut } from '@/utils/actions/shortcut';

  import { CsvParsedTransactionResolution } from '@/core/import/constants';

  const dispatch = createEventDispatcher();

  export let submitDisabled: boolean,
    typeSubmit: boolean = false,
    addCancel: boolean = false;

  let buttonConfig: {
    r: CsvParsedTransactionResolution;
    label: string;
    key: string;
    short: ShortcutSetting;
  }[];
  $: buttonConfig = [
    {
      r: CsvParsedTransactionResolution.save,
      label: $_('common.form.save'),
      key: 'S',
      short: { control: true, code: 'KeyS' },
    },
    {
      r: CsvParsedTransactionResolution.draft,
      label: $_('cmps.transaction.form.saveDraft'),
      key: 'D',
      short: { control: true, code: 'KeyD' },
    },
    {
      r: CsvParsedTransactionResolution.ignore,
      label: $_('cmps.csv.queue.ignore'),
      key: 'I',
      short: { control: true, code: 'KeyI' },
    },
  ];

  let cancelConfig: Omit<ArrayItem<typeof buttonConfig>, 'r' | 'label'>;
  $: cancelConfig = {
    key: 'Esc',
    short: { code: 'Escape' },
  };
</script>

<div class="columns is-centered is-multiline is-mobile">
  {#each buttonConfig as { r, label, short, key }}
    <div class="column is-narrow">
      <button
        class="button"
        disabled={submitDisabled}
        type={typeSubmit ? 'submit' : 'button'}
        on:click={() => dispatch('submit', r)}
        use:shortcut={short}>
        <span>{label}</span>
        <Shortcut setting={short} {key} />
      </button>
    </div>
  {/each}
</div>

{#if addCancel}
  <div class="column is-narrow">
    <button
      class="button is-danger is-outlined"
      type="button"
      on:click={() => dispatch('cancel')}
      use:shortcut={cancelConfig.short}>
      <span>{$_('common.form.cancel')}</span>
      <Shortcut setting={cancelConfig.short} key={cancelConfig.key} />
    </button>
  </div>
{/if}

<style lang="scss">
  .column {
    padding: 0.25rem !important;
  }
</style>
