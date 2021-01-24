<script>
  import FullpageLoader from '@/components/elements/fullpageLoader.svelte';

  import { _ } from 'svelte-i18n';
  import { createEventDispatcher, onMount } from 'svelte';
  import { getNotificationsContext } from 'svelte-notifications/src/context';

  import { AuthService } from '@/services/auth/authService';
  import { WaitlistService } from '@/services/auth/waitlistService';
  import { notification, NotificationStyles } from '@/core/notification';

  const { addNotification } = getNotificationsContext(),
    dispatch = createEventDispatcher();

  export let emailToken: string,
    isWaitlist: boolean = false;

  onMount(async () => {
    let encryptedUserId: string | undefined = undefined,
      alreadyVerified = false;
    try {
      if (isWaitlist) {
        const res = (await WaitlistService.validateEmail(emailToken)).json;
        encryptedUserId = res.encryptedUserId;
        alreadyVerified = res.alreadyVerified;
        if (!encryptedUserId) throw new Error();
      } else await AuthService.validateEmail(emailToken);

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
          text: $_('cmps.user.email.verifyFail'),
          type: NotificationStyles.danger,
        }),
      );
      dispatch('fail');
    }
  });
</script>

<FullpageLoader />
