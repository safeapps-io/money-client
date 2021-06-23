<script>
  import { Onboarding, Text } from '$components/onboarding';

  import { _ } from 'svelte-i18n';
  import { goto } from '$app/navigation';
  import { media } from 'svelte-match-media';

  import { accentTags } from '$utils/accentTags';

  import { addTransactionPath, importPath } from '$core/routes';
  import { runCheck } from '$components/billing/planOfferModal.svelte';
  import { getPageStats } from '$stores/visitRecorder';
  import { hasUserSeenOnboarding } from '$stores/decr/user';

  export let openMenu: undefined | (() => void);

  const key = 'howToAdd';

  $: mobileMode = $media.mobile;
  $: manualAddClasses = $media.mobile ? 'py-4 px-4 mb-3' : '';

  let shouldShow = false;
  $: if ($getPageStats('visit') >= 2) {
    if ($media.mobile && !$hasUserSeenOnboarding('howToAdd')) {
      setTimeout(() => {
        openMenu?.();
        shouldShow = true;
      }, 500);
    } else shouldShow = true;
  }

  const onbClickSlot = () => goto($importPath);
</script>

<div class="has-text-centered">
  <Onboarding bottom {key} {shouldShow} let:finishOnboarding>
    <a
      class="button is-success"
      class:is-light={mobileMode}
      class:is-fullwidth={mobileMode}
      href={$importPath}
      on:click={e => runCheck(e) && finishOnboarding().then(onbClickSlot)}
      >{$_('cmps.transaction.import')}</a>

    <svelte:fragment slot="text">
      <Text header>{$_('routes.wallet.import')}</Text>
      <Text>{$_('cmps.wallet.onboarding.importButton.itsEasy')}</Text>
      <Text>
        {@html $_('cmps.wallet.onboarding.importButton.decision', {
          values: {
            ...accentTags,
            buttonText: $_('cmps.transaction.import'),
          },
        })}
      </Text>
      <button class="button is-small my-3" on:click={finishOnboarding}
        >{$_('common.tryLater')}</button>
    </svelte:fragment>
  </Onboarding>
  <div class={manualAddClasses}>
    <a
      class={'is-size-7 is-underlined ' + manualAddClasses}
      href={$addTransactionPath}
      on:click={runCheck}>{$_('cmps.transaction.add')}</a>
  </div>
</div>
