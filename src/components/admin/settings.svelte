<script>
  import type { PlanPartial } from '$stores/billing';

  import Modal from '$components/elements/modal.svelte';

  import { addHours } from 'date-fns/esm';
  import { goto } from '$app/navigation';

  import { appPath } from '$core/routes';
  import { setUserSetting } from '$stores/decr/user';
  import { plansStore } from '$stores/billing';
  import { walletStore } from '$stores/wallet';

  let active = false,
    showButton = true;

  const resetOnboarding = async () => {
    await setUserSetting('onboarding', {});
    goto(appPath);
    location.reload();
  };

  const changeBilling = (mode: '-1h' | '1h' | '1m') => {
    const hours = mode == '-1h' ? -1 : mode == '1h' ? 1 : 720,
      newExpiryTime = addHours(new Date(), hours).getTime(),
      changePlan = (plan: PlanPartial) => {
        plan.expires = newExpiryTime;
        return plan;
      };

    plansStore.update(state => state.map(changePlan));

    walletStore.update(walletState => {
      for (const wallet of Object.values(walletState!)) {
        for (const walletUser of wallet.users) {
          walletUser.plans.map(changePlan);
        }
      }

      return walletState;
    });
  };
</script>

{#if showButton}
  <button class="button trigger is-small is-danger" on:click={() => (active = true)}>
    <!-- © https://teenyicons.com/ compass -->
    <span class="icon"
      ><svg
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        ><path
          d="M4.5 10.5l-.447-.224a.5.5 0 00.67.671L4.5 10.5zm2-4l-.224-.447a.5.5 0 00-.223.223L6.5 6.5zm4-2l.447.224a.5.5 0 00-.67-.671l.223.447zm-2 4l.224.447a.5.5 0 00.223-.223L8.5 8.5zm-1 5.5A6.5 6.5 0 011 7.5H0A7.5 7.5 0 007.5 15v-1zM14 7.5A6.5 6.5 0 017.5 14v1A7.5 7.5 0 0015 7.5h-1zM7.5 1A6.5 6.5 0 0114 7.5h1A7.5 7.5 0 007.5 0v1zm0-1A7.5 7.5 0 000 7.5h1A6.5 6.5 0 017.5 1V0zM4.947 10.724l2-4-.894-.448-2 4 .894.448zm1.777-3.777l4-2-.448-.894-4 2 .448.894zm3.329-2.67l-2 4 .894.447 2-4-.894-.448zM8.276 8.052l-4 2 .448.894 4-2-.448-.894z"
          fill="currentColor" /></svg
      ></span>
  </button>
{/if}

<Modal bind:active>
  <button class="button" on:click={resetOnboarding}>Reset onboarding</button>

  <hr />

  <p>Plan expiry time</p>

  <button class="button" on:click={() => changeBilling('-1h')}>1 hour ago</button>
  <button class="button" on:click={() => changeBilling('1h')}>In 1 hour</button>
  <button class="button" on:click={() => changeBilling('1m')}>In 1 month</button>

  <hr />

  <button class="button" on:click={() => (showButton = false)}>Hide admin button</button>

  <hr />

  <button
    class="button is-danger"
    on:click={() => {
      throw new Error('Admin error trigger');
    }}>Trigger error</button>
</Modal>

<style>
  .trigger {
    position: fixed;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
