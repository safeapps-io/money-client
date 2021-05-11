<script>
  import { Form, PasswordField } from '$strict';

  import { _ } from 'svelte-i18n';
  import { getContext, onMount, createEventDispatcher } from 'svelte';

  import { AuthService } from '$services/auth/authService';

  export let token: string;

  const dispatch = createEventDispatcher(),
    successNotif = getContext('success'),
    dangerNotif = getContext('danger'),
    success = async (data: { password: string }) => {
      await AuthService.setPasswordFromToken({ ...data, token });
      successNotif($_('cmps.user.password.changed'));
      dispatch('success');
    };

  let isValid = false;
  onMount(() => {
    AuthService.isResetPasswordTokenValid(token)
      .then(() => (isValid = true))
      .catch(() => {
        isValid = false;
        dangerNotif($_('common.errors.linkExpired'));
        dispatch('invalid');
      });
  });
</script>

<Form {success} buttonText={$_('common.form.change')} formDisabled={!isValid}>
  <PasswordField label={$_('cmps.user.password.new')} />
</Form>
