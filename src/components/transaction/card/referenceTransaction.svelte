<script>
  import type { FullEntity, ReferenceTransaction } from '$stores/decr/types';

  import DeleteEntityButton from '$components/elements/deleteEntityButton.svelte';
  import ActionsDropdown from '$components/elements/dropdown/actions.svelte';

  import { createEventDispatcher } from 'svelte';
  import { _ } from 'svelte-i18n';

  import { focusableShortcut } from '$utils/actions/shortcut';
  import { moneyFormat } from '$utils/number';

  import { defaultAssetStore } from '$stores/decr/asset';
  import { relativeDate } from '$core/i18n/relativeDate';
  import { runCheck } from '$components/billing/planOfferModal.svelte';

  export let referenceTransaction: FullEntity<ReferenceTransaction>,
    activeTransactionId: string | undefined = undefined;

  const dispatch = createEventDispatcher(),
    setActiveStatus = () => dispatch('setActive', referenceTransaction.id);
</script>

<div class="is-flex space-between">
  <div class="flex-full">
    <p class="has-text-weight-semibold is-size-5">
      {$moneyFormat(referenceTransaction.decr.amount, $defaultAssetStore.decr.code)}
      {#if referenceTransaction.id == activeTransactionId}
        <span class="is-size-7">{$_('cmps.transaction.reference.active')}</span>
      {/if}
    </p>
    <p class="is-size-7">{$relativeDate(referenceTransaction.decr.datetime)}</p>
  </div>

  <div class="actions">
    <ActionsDropdown let:hide>
      {#if referenceTransaction.id == activeTransactionId}
        <p class="dropdown-item has-text-grey-light">{$_('cmps.transaction.reference.active')}</p>
      {:else}
        <div
          class="dropdown-item has-text-success-dark"
          role="button"
          tabindex="0"
          on:click={() => {
            if (runCheck()) {
              setActiveStatus();
              hide();
            }
          }}
          use:focusableShortcut>
          {$_('cmps.transaction.reference.activate')}
        </div>
      {/if}

      <hr class="dropdown-divider" />

      <DeleteEntityButton
        entityMap={{ [referenceTransaction.walletId]: [referenceTransaction.id] }}
        let:click
        let:buttonText>
        <div
          class="dropdown-item has-text-danger"
          role="button"
          tabindex="0"
          on:click={click}
          on:click={hide}
          use:focusableShortcut>
          {buttonText}
        </div>
      </DeleteEntityButton>
    </ActionsDropdown>
  </div>
</div>

<style lang="scss">
  .actions {
    align-self: flex-start;
  }
</style>
