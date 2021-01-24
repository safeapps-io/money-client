<script>
  import type { FileParsedToBinary } from './types';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { media } from 'svelte-match-media';
  import { noop } from 'svelte/internal';

  const dispatch = createEventDispatcher();

  export let noDataParsed: boolean;

  let notCsvError = false;

  const enum State {
    def,
    hover,
    loading,
  }
  let state = State.def;

  const resetState = () => {
      state = State.def;
      notCsvError = false;
    },
    parseFile = (fileList: FileList | undefined | null) => {
      if (!fileList) return resetState();

      const file = fileList[0],
        reader = new FileReader();

      if (!['text/csv', 'application/vnd.ms-excel'].includes(file.type)) {
        notCsvError = true;
        return (state = State.def);
      }

      state = State.loading;
      reader.onload = loadEvent => {
        if (loadEvent.target?.result) {
          const res: FileParsedToBinary = {
            data: loadEvent.target.result as ArrayBuffer,
            filename: file.name,
          };
          dispatch('binaryData', res);
        }
      };

      reader.readAsArrayBuffer(file);
    };

  const dragEnter = (e: DragEvent) => {
      if (!e.dataTransfer) return;
      e.dataTransfer.dropEffect = 'copy';
      state = State.hover;
    },
    drop = (e: DragEvent) => parseFile(e.dataTransfer?.files),
    onChange = (e: Event & { currentTarget: EventTarget & HTMLInputElement }) =>
      parseFile(e.currentTarget.files);

  let ref: HTMLInputElement | undefined;
  const click = () => ref?.click();
</script>

<style lang="scss">
  .wrapper {
    min-height: 400px;
  }

  .messages,
  .dropzone {
    position: absolute;

    left: 0;
    right: 0;
  }

  .messages {
    top: 50%;
    transform: translateY(-50%);
  }

  $default-border-width: 2px;
  .dropzone {
    top: 0;
    bottom: 0;

    border: $default-border-width dotted rgb(184, 184, 184);
    // So the onboarding looks nice
    background: radial-gradient($scheme-main 20%, rgba(255, 255, 255, 0.001%));

    cursor: pointer;
  }

  .hover,
  .loading {
    border-width: $default-border-width + 2;
    border-color: $success;
  }
</style>

<div class="wrapper is-relative has-text-centered" on:click={click}>
  <div
    class="dropzone"
    class:hover={state == State.hover}
    class:loading={state == State.loading}
    on:dragover|preventDefault|stopPropagation={noop}
    on:drag|preventDefault|stopPropagation={noop}
    on:dragenter|preventDefault|stopPropagation={dragEnter}
    on:dragleave|preventDefault|stopPropagation={resetState}
    on:drop|preventDefault|stopPropagation={drop}>
    <div class="messages">
      <svg
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="25"
        height="25"><path
          d="M7.5 1.5l3.25 3m-3.25-3l-3 3m3-3V11m6-4v6.5h-12V7"
          stroke="currentColor" /></svg>
      <div class="is-size-5">{$_('cmps.csv.file.press')}</div>

      {#if !$media.mobile}
        <div>{$_('cmps.csv.file.drag')}</div>
      {/if}

      {#if noDataParsed}
        <p class="errors has-text-danger is-size-7" in:slide>{$_('cmps.csv.file.noParsedData')}</p>
      {:else if notCsvError}
        <p class="errors has-text-danger is-size-7" in:slide>{$_('cmps.csv.file.notCsv')}</p>
      {/if}
    </div>
  </div>

  <input type="file" hidden bind:this={ref} on:change={onChange} />
</div>
