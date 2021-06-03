<script context="module">
  export const controlFinanceId = 1,
    manageFamilyBudgetId = 2,
    payoffDebtId = 3,
    assetManagementId = 4,
    longTermId = 5;
</script>

<script>
  import type { PlanFull } from '$stores/billing';

  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';
  import YourProblems from './yourProblems.svelte';

  import { _ } from 'svelte-i18n';
  import { dev } from '$app/env';

  import { setUserSetting, userDecrStore } from '$stores/decr/user';
  import Purchase from './purchase.svelte';

  export let plan: PlanFull;

  const problems = [
    { id: controlFinanceId, text: $_('cmps.billing.onboarding.problems.control') },
    { id: manageFamilyBudgetId, text: $_('cmps.billing.onboarding.problems.family') },
    { id: payoffDebtId, text: $_('cmps.billing.onboarding.problems.debt') },
    {
      id: assetManagementId,
      text: $_('cmps.billing.onboarding.problems.asset.title'),
      tooltipText: $_('cmps.billing.onboarding.problems.asset.tooltip'),
    },
    {
      id: longTermId,
      text: $_('cmps.billing.onboarding.problems.long.title'),
      tooltipText: $_('cmps.billing.onboarding.problems.long.tooltip'),
    },
  ];

  let key: 1 | 2;
  $: if ($userDecrStore?.decr.settings?.userProblems) key = 2;
  else key = 1;
</script>

<CrossfadeWrapper {key}>
  {#if key == 1}
    <YourProblems {problems} on:next={({ detail }) => setUserSetting('userProblems', detail)} />
  {:else}
    {#if dev}
      <button
        class="button is-dark is-small"
        on:click={() => setUserSetting('userProblems', undefined)}
        style="position:fixed;top:0;">Reset problems</button>
    {/if}
    <div class="container">
      <Purchase {plan} />
    </div>
  {/if}
</CrossfadeWrapper>
