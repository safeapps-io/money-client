<script>
  import ZeroData from '$components/elements/zeroData.svelte';
  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';

  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';

  export let fetchData: () => Promise<any>;

  // [l]oading, [d]ata, [e]rror
  let state: 'l' | 'd' | 'e' = 'l';
  onMount(() => {
    fetchData()
      .then(() => (state = 'd'))
      .catch(() => (state = 'e'));
  });
</script>

<CrossfadeWrapper replayAnimationKey={state}>
  {#if state == 'l'}
    <ZeroData text={$_('cmps.nav.loading')} />
  {:else if state == 'd'}
    <slot />
  {:else}
    <ZeroData text={$_('common.errors.tryLater')} />
  {/if}
</CrossfadeWrapper>
