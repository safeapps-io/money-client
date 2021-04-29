<script>
  import '../styles/layouts/_app.scss';

  import Meta from '$components/nav/meta.svelte';
  import Notifications from '$components/elements/notifications.svelte';

  import { onMount } from 'svelte';
  import { isLoading } from 'svelte-i18n';

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
  $: if (!$isLoading) localesLoaded = true;
</script>

<Meta title="[safe] money" />

{#if appInitialized && localesLoaded}
  <Notifications>
    <slot />
  </Notifications>
{/if}
