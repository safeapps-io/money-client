<script>
  import { goto } from '$app/navigation';

  import { appPath } from '$core/routes';
  import { setUserSetting } from '$stores/decr/user';

  const resetOnboarding = async () => {
    await setUserSetting('onboarding', {});
    goto(appPath);
    location.reload();
  };
</script>

<button class="button" on:click={resetOnboarding}>Reset onboarding</button>

<hr />
