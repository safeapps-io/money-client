<script>
  import FullpageLoader from '$components/elements/fullpageLoader.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, onMount } from 'svelte';
  import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { notification, NotificationStyles } from '$core/notification';

  const { addNotification } = getNotificationsContext(),
    dispatch = createEventDispatcher();

  export let req: () => Promise<any>, successMessage: string, errorMessage: string;

  onMount(async () => {
    try {
      await req();
      addNotification(
        notification({
          text: successMessage,
        }),
      );
      dispatch('success');
    } catch (error) {
      addNotification(
        notification({
          text: errorMessage,
          type: NotificationStyles.danger,
        }),
      );
      dispatch('fail');
    }
  });
</script>

<FullpageLoader />
