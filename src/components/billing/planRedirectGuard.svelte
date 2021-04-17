<script>
  import { getContext } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';

  import { rootWalletPath, userBillingPath } from '$core/routes';
  import { planGuardStore } from '$stores/billing';
  import { currentWalletStore } from '$stores/wallet';

  export let currentUserCheck: boolean = false,
    runCheck: boolean = true;

  const warningNorif = getContext('warning');

  const billingCheck = $planGuardStore(currentUserCheck);
  if (runCheck && !billingCheck.planActive)
    if (billingCheck.userCanBuy) goto(userBillingPath, { replaceState: true });
    else {
      goto($rootWalletPath($currentWalletStore!.id), { replaceState: true });
      warningNorif($_('cmps.billing.planGuard.askOwner'));
    }
</script>

<!-- Always show a slot if `runCheck` is disabled -->
{#if !runCheck || billingCheck.planActive}
  <slot />
{/if}
