<script>
  import '../styles/layouts/_app.scss';

  import Meta from '$components/nav/meta.svelte';
  import Notifications from '$components/elements/notifications.svelte';

  import { onMount } from 'svelte';
  import { isLoading, locale } from 'svelte-i18n';

  import { initStores } from '$stores/init';
  import { initTrackErrors } from '$services/trackErrors';
  import { i18nInit } from '$core/i18n';
  import { matchMediaInit } from '$core/matchMedia';

  let appInitialized = false;
  onMount(async () => {
    initTrackErrors();
    i18nInit();
    matchMediaInit();

    const subscriptions = await initStores();
    appInitialized = true;

    return () => subscriptions.forEach(fn => fn?.());
  });

  // We only want to block the UI when locale files are first loaded and not when locale is switched
  let localesLoaded = false;

  /**
   * Sometimes for very odd reasons svelte-i18n throws an error "cannot translate without setting
   * initial locale". There's no race conditions here, and locale IS set. Super odd behavior, that
   * only works if you visit a page with localication stuff before any redirects.
   *
   * This strangely fixes it. Don't know what to do with it.
   */
  $: if (!$isLoading && $locale) localesLoaded = true;
</script>

<Meta title="[safe] money" />

{#if appInitialized && localesLoaded}
  <Notifications>
    <slot />
  </Notifications>
{/if}
