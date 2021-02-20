<script>
  import type { FileParsedToBinary } from './types';

  import Loader from '@/components/elements/loader.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { media } from 'svelte-match-media';
  import { noop } from 'svelte/internal';
  import uploadIcon from 'teenyicons/outline/upload.svg';

  const dispatch = createEventDispatcher();

  export let noDataParsed: boolean;

  let notUpportedError = false;

  const enum State {
    def,
    hover,
    loading,
  }
  let state = State.def;

  $: if (noDataParsed) state = State.def;

  const resetState = () => {
      state = State.def;
      notUpportedError = false;
    },
    parseFile = (fileList: FileList | undefined | null) => {
      if (!fileList) return resetState();

      const file = fileList[0],
        reader = new FileReader();

      if (!file.name.endsWith('.csv') && !file.name.endsWith('.ofx')) {
        notUpportedError = true;
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
      {#if state == State.loading}
        <Loader />
      {:else}
        <img src={uploadIcon} alt="loader icon" height="25" width="25" />
        <div class="is-size-5">{$_('cmps.import.file.press')}</div>

        {#if !$media.mobile}
          <div>{$_('cmps.import.file.drag')}</div>
        {/if}
      {/if}

      {#if noDataParsed}
        <p class="errors has-text-danger is-size-7" in:slide>
          {$_('cmps.import.file.noParsedData')}
        </p>
      {:else if notUpportedError}
        <p class="errors has-text-danger is-size-7" in:slide>
          {@html $_('cmps.import.file.unsupported', {
            values: { tagO: '<code>', tagC: '</code>' },
          })}
        </p>
      {/if}
    </div>
  </div>

  <input type="file" hidden bind:this={ref} on:change={onChange} />
</div>

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
