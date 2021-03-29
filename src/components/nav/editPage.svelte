<script>
  /**
   * This component basically allows us to have direct links to entities, that won't fail
   * if user does not have locally yet.
   * It would wait for sync to finish and then decide if it should be 404 page or the cmp
   * that you passed as slot.
   *
   * IDEA: Show some kind of alert if the sync takes too much time or if user is offline.
   * It should tell user that this piece of data is not available offline yet, so they
   * need to come here later.
   */

  import { _ } from 'svelte-i18n';

  import { syncStatusStore, SyncStatuses } from '$stores/sync';

  export let hasEnt: boolean;
  $: loading = $syncStatusStore !== SyncStatuses.finished;
</script>

{#if hasEnt}
  <slot />
{:else if loading}
  <h3 class="title">{$_('cmps.nav.loading')}</h3>
{:else}
  <h3 class="title has-text-danger">{$_('cmps.nav.404.title')}</h3>
  <p>{$_('cmps.nav.404.main')}</p>
{/if}
