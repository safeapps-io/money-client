<script>
  import Meta from '$components/nav/meta.svelte';
  import Notifications from '$components/elements/notifications.svelte';

  import { onMount } from 'svelte';
  import { isLoading } from 'svelte-i18n';

  import { initStores } from '$stores/init';
  import { i18nInit } from '$core/i18n';
  import { matchMediaInit } from '$core/matchMedia';

  let appInitialized = false;
  onMount(async () => {
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

<Meta
  title="Trustless manifesto // @safeapps.io"
  description="My vision on how we should build apps that are safe for user's data." />

{#if appInitialized && localesLoaded}
  <Notifications>
    <slot />
  </Notifications>
{/if}

<style global lang="scss">
  @import 'src/styles/layouts/app';

  // This stinks, but can't do anything until it fixes: https://github.com/keenethics/svelte-notifications/issues/37
  .default-position-style-bottom-right {
    @include z(notification-toast);
  }
</style>
