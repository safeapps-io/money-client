<script>
  import type { PlanFull } from '$stores/billing';

  import LoadingBlock from '$components/elements/loadingBlock.svelte';
  import Logo from '$components/nav/logo.svelte';
  import FullpageLoader from '$components/elements/fullpageLoader.svelte';
  import { InitialOnboardingWizard } from '$components/onboarding';

  import { _ } from 'svelte-i18n';
  import { isAfter } from 'date-fns';

  import { BillingService } from '$services/billing/billingService';

  let plan: PlanFull | null = null;
  $: isActive = isAfter(plan?.expires || 0, new Date());
</script>

<LoadingBlock
  fetchData={async () => !plan && BillingService.getPlan().then(({ json }) => (plan = json))}>
  <svelte:fragment slot="loading"><FullpageLoader /></svelte:fragment>

  {#if isActive}
    <slot />
  {:else if plan}
    <div class="pt-6 mb-6">
      <Logo />
    </div>

    <InitialOnboardingWizard {plan} />
  {/if}
</LoadingBlock>
