<script>
  import { Onboarding, Text } from '@/components/onboarding';

  import { _ } from 'svelte-i18n';
  import { goto } from '@sapper/app';
  import { media } from 'svelte-match-media';

  import { addTransactionPath, csvParsePath } from '@/core/routes';

  export let shouldShowOnboarding = true;

  const key = 'howToAdd';

  $: mobileMode = $media.mobile;
  $: manualAddClasses = $media.mobile ? 'py-4 px-4 mb-3' : '';

  const onbClickSlot = () => goto($csvParsePath);
</script>

<div class="has-text-centered">
  <Onboarding
    bottom
    {key}
    right={!mobileMode}
    shouldShow={shouldShowOnboarding}
    let:finishOnboarding>
    <a
      class="button is-success"
      class:is-light={mobileMode}
      class:is-fullwidth={mobileMode}
      href={$csvParsePath}
      on:click={() => finishOnboarding().then(onbClickSlot)}>{$_('cmps.transaction.import')}</a>

    <div slot="text">
      <Text header>{$_('routes.wallet.import')}</Text>
      <Text>{$_('cmps.wallet.onboarding.importButton.itsEasy')}</Text>
      <Text>
        {@html $_('cmps.wallet.onboarding.importButton.decision', {
          values: {
            tagO: '<span class="has-text-weight-bold">',
            tagC: '</span>',
            buttonText: $_('cmps.transaction.import'),
          },
        })}
      </Text>

      <button class="button is-small my-3" on:click={finishOnboarding}
        >{$_('common.tryLater')}</button>
    </div>
  </Onboarding>
  <div class={manualAddClasses}>
    <a class={'is-size-7 is-underlined ' + manualAddClasses} href={$addTransactionPath}
      >{$_('cmps.transaction.add')}</a>
  </div>
</div>
