<script>
  import FullpageLoader from '@/components/elements/fullpageLoader.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, onMount } from 'svelte';
  import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { AuthService } from '@/services/auth/authService';
  import { notification, NotificationStyles } from '@/core/notification';

  const { addNotification } = getNotificationsContext(),
    dispatch = createEventDispatcher();

  export let emailToken: string;

  onMount(async () => {
    let encryptedUserId: string | undefined = undefined,
      alreadyVerified = false;
    try {
      await AuthService.validateEmail(emailToken);

      if (!alreadyVerified)
        addNotification(
          notification({
            text: $_('cmps.user.email.verifiedNotif'),
          }),
        );
      dispatch('success', encryptedUserId);
    } catch (error) {
      addNotification(
        notification({
          text: $_('common.errors.linkExpired'),
          type: NotificationStyles.danger,
        }),
      );
      dispatch('fail');
    }
  });
</script>

<FullpageLoader />
