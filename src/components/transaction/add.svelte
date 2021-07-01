<script>
  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { media } from 'svelte-match-media';

  import { addTransactionPath, importPath } from '$core/routes';
  import { runCheck } from '$components/billing/planOfferModal.svelte';
  import { hasUserSeenOnboarding } from '$stores/decr/user';

  export let openMenu: undefined | (() => void);

  const key = 'howToAdd';

  $: mobileMode = $media.mobile;
  $: manualAddClasses = $media.mobile ? 'py-4 px-4 mb-3' : 'px-4 py-2';

  let shouldShow = false;
  // We do not show contactUs on mobile
  $: if (!shouldShow && ($hasUserSeenOnboarding('contactUs') || $media.mobile))
    if ($media.mobile && !$hasUserSeenOnboarding(key)) {
      setTimeout(() => {
        openMenu?.();
        shouldShow = true;
      }, 1000);
    } else shouldShow = true;

  const onbClickSlot = () => goto($importPath);
</script>

<Onboarding preventSlotClick bottom {key} {shouldShow} let:finishOnboarding let:show>
  <div class="has-text-centered">
    <a
      class="button is-success"
      class:is-light={mobileMode}
      class:is-fullwidth={mobileMode}
      href={$importPath}
      on:click={e => runCheck(e) && finishOnboarding().then(onbClickSlot)}
      >{$_('cmps.transaction.import')}</a>

    <div class={manualAddClasses}>
      <a
        class="is-size-7 is-underlined {manualAddClasses}"
        class:has-background-white={show}
        href={$addTransactionPath}
        on:click={runCheck}>{$_('cmps.transaction.add')}</a>
    </div>
  </div>

  <svelte:fragment slot="text">
    <Text header>{$_('cmps.wallet.onboarding.importButton.header')}</Text>
    <Text>{$_('cmps.wallet.onboarding.importButton.add')}</Text>
    <Text>{$_('cmps.wallet.onboarding.importButton.bulkAdvantage')}</Text>
    <button class="button is-small my-3" on:click={finishOnboarding}>{$_('common.form.ok')}</button>
  </svelte:fragment>
</Onboarding>
