<script>
  import type { ChargeEvent, PlanFull } from '$stores/billing';

  import Purchase from './purchase.svelte';
  import LoadingBlock from '$components/elements/loadingBlock.svelte';

  import { date, _ } from 'svelte-i18n';
  import { isAfter, differenceInDays } from 'date-fns/esm';

  import { unsortedChargeEventsStore, chargeEventsStore } from '$stores/billing';
  import { BillingService } from '$services/billing/billingService';

  const now = new Date();

  let plan: PlanFull,
    isActive: boolean,
    formattedExpires: string,
    duration: string,
    planType: ChargeEvent['chargeType'];

  $: if (plan) {
    isActive = isAfter(plan.expires || 0, now);
    formattedExpires = $date(plan.expires || 0);
    switch (plan.product.duration) {
      case 30:
        duration = $_('cmps.searchFilter.period.month');
        break;

      case 365:
        duration = $_('cmps.searchFilter.period.year');
        break;

      default:
        duration = '';
    }

    $unsortedChargeEventsStore = plan.chargeEvents;
    planType = $chargeEventsStore[0].chargeType;
  }

  const chargeExpiredText = (dt: number | null) => (dt ? $date(dt) : '—');
</script>

<LoadingBlock fetchData={() => BillingService.getPlan().then(({ json }) => (plan = json))}>
  <div class="data">
    <p>{$_('cmps.billing.price')}</p>
    <p>${plan.product.price / 100}/{duration.toLowerCase()}</p>
    <p>{$_('cmps.billing.state.title')}</p>
    <p>
      {isActive ? $_('cmps.billing.state.active') : $_('cmps.billing.state.expired')}
      {#if planType == 'trial'}({$_('cmps.billing.state.trial')}){/if}
    </p>
    <p>{$_('cmps.billing.expiryDate')}</p>
    <p>{formattedExpires}</p>
  </div>

  <!--
      We offer to create a new payment if:
      1. no expires is set (could be a bug, whatever)
      2. the plan is already expired
      3. plan will expire in the next 30 days
    -->
  {#if !plan.expires || isAfter(now, plan.expires) || differenceInDays(plan.expires, now) <= 30}
    <div class="my-6">
      <Purchase />
    </div>
  {/if}

  <h3 class="is-size-5 has-text-weight-bold mb-3">{$_('cmps.billing.changeHistory')}</h3>
  <ul>
    {#each $chargeEventsStore as charge (charge.id)}
      <li class="py-3 px-5 mb-5">
        <p class="is-size-5 mb-4">
          #<span class="has-text-weight-bold">{charge.id}</span>
          <span
            class="tag"
            class:is-success={charge.eventType == 'confirmed'}
            class:is-info={charge.eventType == 'pending'}
            class:is-danger={['refunded', 'failed'].includes(charge.eventType)}
            >{charge.eventType}</span>
          {#if charge.chargeType == 'trial'}
            <span class="tag">{charge.chargeType}</span>
          {/if}
        </p>

        <div class="data">
          <p>{$_('cmps.transaction.common.date')}</p>
          <p>{$date(charge.created)}</p>
          <p>{$_('cmps.billing.payMethods.title')}</p>
          <p>
            {charge.provider == 'coinbase'
              ? $_('cmps.billing.payMethods.crypto')
              : $_('cmps.billing.payMethods.card')}
          </p>
          <p>{$_('cmps.billing.expiryDateChanged')}</p>
          <p>{chargeExpiredText(charge.expiredOld)} ⇒ {chargeExpiredText(charge.expiredNew)}</p>
        </div>
      </li>
    {/each}
  </ul>
</LoadingBlock>

<style lang="scss">
  .data {
    display: grid;
    grid-template-columns: 1fr 2fr;
    @include mq($until: tablet) {
      grid-template-columns: 1fr;
    }

    p {
      margin: 0.5em 0;
    }

    :nth-child(odd) {
      color: gray;
    }
    :nth-child(even) {
      font-weight: bold;
    }
  }

  li:nth-child(odd) {
    background-color: hsla(0, 0%, 80%, 0.095);
  }
</style>
