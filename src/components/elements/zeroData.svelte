<script>
  import { _ } from 'svelte-i18n';

  export let text: string | undefined = undefined;
</script>

<div>{text || $_('cmps.elements.defZeroData') + ' 😑'}</div>

<style lang="scss">
  div {
    text-align: center;
    padding: 6em 0;
  }
</style>
