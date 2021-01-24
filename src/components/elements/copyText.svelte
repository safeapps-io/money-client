<script>
  import { _ } from 'svelte-i18n';

  export let text: string;

  let ref: HTMLElement;
  const copy = () => {
    const range = document.createRange();
    range.selectNode(ref);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    document.execCommand('copy');
  };
</script>

<style lang="scss">
  figure {
    // Making it so it doesn't stretch the parent
    width: 0;
    min-width: 100%;
  }

  pre {
    overflow: scroll;
  }

  .copy {
    position: absolute;
    top: 50%;
    right: 5px;

    transform: translateY(-50%);
  }
</style>

<figure class="py-3 px-0 is-relative">
  <pre class="px-3 py-4">
    <code bind:this={ref}>{text}</code>
  </pre>
  <button class="button is-small copy" on:click={copy}>{$_('cmps.elements.copy')}</button>
</figure>
