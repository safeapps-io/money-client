<script>
  import { _ } from 'svelte-i18n';
  import { createEventDispatcher } from 'svelte';
  import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { notification, NotificationStyles } from '@/core/notification';

  import { deletedAdd } from '@/stores/decr/deleted';
  import { userEncrStore } from '@/stores/user';

  const { addNotification } = getNotificationsContext(),
    dispatch = createEventDispatcher();

  export let entityMap: { [walletId: string]: string[] },
    runBefore: (() => Promise<boolean>) | undefined = undefined,
    buttonText: string | undefined = $_('cmps.deleteEntity.delete');

  const click = async () => {
    try {
      if (runBefore) {
        const goFurther = await runBefore();
        if (!goFurther) return;
      } else if (
        !window.confirm(
          $_('cmps.deleteEntity.confirmation') + ' ' + $_('cmps.deleteEntity.irreversible'),
        )
      )
        return;

      dispatch('delete');

      await Promise.all(
        Object.entries(entityMap).map(([walletId, ids]) =>
          deletedAdd(walletId, { ids, remoteDeleted: false, initiatorId: $userEncrStore!.id }),
        ),
      );
      addNotification(notification({ text: $_('cmps.deleteEntity.success') }));
    } catch (error) {
      addNotification(
        notification({ text: $_('cmps.deleteEntity.error'), type: NotificationStyles.danger }),
      );
    }
  };
</script>

<slot {click} {buttonText}>
  <button class="button is-danger is-outlined" on:click={click} type="button">{buttonText}</button>
</slot>
