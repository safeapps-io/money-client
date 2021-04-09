<script>
  import type { Providers } from '$stores/billing';

  import CrossfadeWrapper from '$components/elements/crossfadeWrapper.svelte';

  import { slide } from 'svelte/transition';
  import { _ } from 'svelte-i18n';

  import { accentTags, generateLinkTags } from '$utils/accentTags';
  import { BillingService } from '$services/billing/billingService';
  import { userSettingsPath } from '$core/routes';

  // [ch]oose, [l]ink, [e]rror
  let state: 'ch' | 'l' | 'e' = 'ch',
    choosenProvider: Providers | false = false,
    link: string | null = null;

  const buttons: { iconClass: string; d: string; text: string; provider: Providers }[] = [
    {
      iconClass: 'has-text-warning',
      provider: 'coinbase',
      // © https://teenyicons.com/ bitcoin
      d:
        'M3.5 1.5h5a3 3 0 110 6h-5m0-6v6m0-6H2m1.5 0V0m0 7.5h6a3 3 0 110 6h-6m0-6v6m0-6H2m1.5 6H2m1.5 0V15m4-15v1.5m0 12V15',
      text: $_('cmps.billing.payMethods.crypto'),
    },
    {
      iconClass: 'has-text-danger',
      provider: 'tinkoff',
      // © https://teenyicons.com/ card
      d:
        'M.5 5.5h14M2 9.5h6m2 0h3M.5 3.5v8a1 1 0 001 1h12a1 1 0 001-1v-8a1 1 0 00-1-1h-12a1 1 0 00-1 1z',
      text: $_('cmps.billing.payMethods.card'),
    },
  ];

  const initPayment = async (provider: Providers) => {
      choosenProvider = provider;

      try {
        const { json } = await BillingService.createCharge(provider);
        link = json.link;
        state = 'l';
      } catch (error) {
        choosenProvider = false;
        state = 'e';
      }
    },
    cancel = () => {
      link = null;
      choosenProvider = false;
      state = 'ch';
    };
</script>

<CrossfadeWrapper replayAnimationKey={state}>
  {#if state == 'ch' || state == 'e'}
    <div class="columns is-multiline has-text-centered">
      <div class="column is-full">
        <div class="alert py-3 px-4">
          <p class="has-text-weight-bold">{$_('cmps.billing.emailNotSet.title')}</p>
          <p class="is-size-7">
            {@html $_('cmps.billing.emailNotSet.shouldSet', {
              values: generateLinkTags(userSettingsPath),
            })}
          </p>
        </div>
      </div>

      <div class="column is-full">{$_('cmps.billing.payMethods.choose')}</div>
      {#each buttons as { d, iconClass, text, provider } (provider)}
        <div class="column is-half">
          <button
            class="button is-primary is-fullwidth"
            class:is-color-loading={choosenProvider == provider}
            disabled={choosenProvider && choosenProvider != provider}
            on:click={() => initPayment(provider)}>
            {#if !choosenProvider || choosenProvider != provider}
              <span class="icon {iconClass}"
                ><svg
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="15"
                  height="15"><path {d} stroke="currentColor" /></svg
                ></span>
            {/if}
            <span>{text}</span></button>
        </div>
      {/each}
      {#if state == 'e'}
        <div class="column has-text-centered" transition:slide|local>
          <p class="help is-danger">{$_('common.errors.tryLater')}</p>
        </div>
      {:else}
        <div class="column has-text-centered" transition:slide|local>
          <p class="help">{$_('cmps.billing.providers.thirdParty')}</p>
          <p class="help">{$_('cmps.billing.providers.canUseIncognito')}</p>
        </div>
      {/if}
    </div>
  {:else if state == 'l'}
    <div class="has-text-centered">
      <div class="mb-3">
        {#if choosenProvider == 'tinkoff'}
          <p>
            {@html $_('cmps.billing.providers.tinkoff.intro', { values: accentTags })}
          </p>
          <p>
            {@html $_('cmps.billing.providers.tinkoff.rubles', { values: accentTags })}
          </p>
        {:else}
          <p>
            {@html $_('cmps.billing.providers.coinbase.intro', { values: accentTags })}
          </p>
          <p class="is-size-7">
            {$_('cmps.billing.providers.coinbase.support')}
          </p>
        {/if}
      </div>
      <a href={link || ''} class="button is-primary">{$_('cmps.billing.providers.goto')}</a>
      <p class="help">{$_('cmps.billing.providers.useInc')}</p>
      <p class="help">{$_('common.or').toLowerCase()}</p>
      <button class="button is-small is-danger is-outlined" on:click={cancel}
        >{$_('common.form.cancel')}</button>
    </div>
  {/if}
</CrossfadeWrapper>

<style>
  .alert {
    color: white;
    background: linear-gradient(130deg, hsl(120, 58%, 40%), ease-in-out, hsl(187, 83%, 36%));
    border-radius: 0.5em;

    :global(a) {
      color: white;
      text-decoration: underline;

      &:hover {
        text-decoration: none;
      }
    }
  }
</style>
