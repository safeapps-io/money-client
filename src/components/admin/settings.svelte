<script>
  import { goto } from '@sapper/app';

  import { appPath } from '@/core/routes';
  import { syncConnection } from '@/services/sync/syncConnection';
  import { setUserSetting } from '@/stores/decr/user';

  const resetOnboarding = async () => {
    await setUserSetting('onboarding', {});
    goto(appPath);
    location.reload();
  };

  const closeConnection = (ms: number) =>
    setTimeout(() => $syncConnection?.closeConnection(false), ms);
</script>

<button class="button" on:click={resetOnboarding}>Reset onboarding</button>

<hr />

<button class="button" on:click={() => closeConnection(3500)}>Close WS connection (3.5s)</button>
<button class="button" on:click={() => closeConnection(10000)}>Close WS connection (10s)</button>
<p class="help">Will have an attempt to reopen it.</p>
